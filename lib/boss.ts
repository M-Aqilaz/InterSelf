import {
  ActivityType,
  BossProgressStatus,
  BossStatus,
  Prisma,
  TaskCategory,
  TaskDifficulty,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";
import type { BossBattleState, BossBattleSummary, BossWithReward } from "@/types/boss";

const DAMAGE_COOLDOWN_MS = 60 * 1000; // 60 seconds between hits
const DAMAGE_WINDOW_MS = DAMAGE_COOLDOWN_MS;
const BASE_DAMAGE = 40;
const DAMAGE_PER_EXP = 0.45;
const DAMAGE_PER_STAT = 4;
const DAMAGE_PER_LEVEL = 3;
const DAMAGE_PER_STREAK = 1.25;
const WEAKNESS_BONUS = 1.35;
const MIN_DAMAGE = 15;

const difficultyMultipliers: Record<TaskDifficulty, number> = {
  EASY: 1,
  MEDIUM: 1.15,
  HARD: 1.35,
  LEGENDARY: 1.6,
};

const weaknessMultiplier = (boss: BossWithReward | null, category: TaskCategory) => {
  if (!boss?.weakness) return 1;
  return boss.weakness === category ? WEAKNESS_BONUS : 1;
};

const now = () => new Date();

type PrismaClientOrTx = Prisma.TransactionClient | Prisma.DefaultPrismaClient;

export type ProfileWithBoss = Prisma.ProfileGetPayload<{
  include: { currentBoss: { include: { rewardItem: true } } };
}>;

type BossDamageContext = {
  tx: Prisma.TransactionClient;
  userId: string;
  profile: ProfileWithBoss | null;
  expReward: number;
  statIncreases: Record<string, number>;
  streak: number;
  level: number;
  taskCategory: TaskCategory;
  taskDifficulty: TaskDifficulty;
};

async function findFirstActiveBoss(client: PrismaClientOrTx) {
  return client.boss.findFirst({
    where: { status: BossStatus.ACTIVE },
    orderBy: { id: "asc" },
    include: { rewardItem: true },
  });
}

async function findNextBoss(tx: Prisma.TransactionClient, currentBossId?: number | null) {
  if (!currentBossId) {
    return findFirstActiveBoss(tx);
  }

  const nextBoss = await tx.boss.findFirst({
    where: { status: BossStatus.ACTIVE, id: { gt: currentBossId } },
    orderBy: { id: "asc" },
    include: { rewardItem: true },
  });

  if (nextBoss) {
    return nextBoss;
  }

  return findFirstActiveBoss(tx);
}

export async function assignInitialBoss(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<ProfileWithBoss | null> {
  const boss = await findFirstActiveBoss(tx);
  if (!boss) {
    return null;
  }

  await tx.profile.update({
    where: { userId },
    data: {
      currentBossId: boss.id,
    },
  });

  await ensureUserBossProgress(tx, userId, boss);

  return tx.profile.findUnique({
    where: { userId },
    include: { currentBoss: { include: { rewardItem: true } } },
  });
}

export async function ensureUserBossProgress(
  client: PrismaClientOrTx,
  userId: string,
  boss: BossWithReward
) {
  return client.userBossProgress.upsert({
    where: {
      userId_bossId: {
        userId,
        bossId: boss.id,
      },
    },
    create: {
      userId,
      bossId: boss.id,
      currentHp: boss.maxHp,
      status: BossProgressStatus.ACTIVE,
    },
    update: {},
  });
}

function calculateDamage({
  expReward,
  statIncreases,
  streak,
  level,
  taskDifficulty,
  categoryMultiplier,
}: {
  expReward: number;
  statIncreases: Record<string, number>;
  streak: number;
  level: number;
  taskDifficulty: TaskDifficulty;
  categoryMultiplier: number;
}) {
  const statBoost = Object.values(statIncreases).reduce((sum, value) => sum + value, 0);
  const streakBonus = 1 + Math.min(streak / 100, 0.75);
  const difficultyBonus = difficultyMultipliers[taskDifficulty];

  const rawDamage =
    BASE_DAMAGE +
    expReward * DAMAGE_PER_EXP +
    statBoost * DAMAGE_PER_STAT +
    level * DAMAGE_PER_LEVEL +
    streak * DAMAGE_PER_STREAK;

  return Math.max(
    MIN_DAMAGE,
    Math.round(rawDamage * difficultyBonus * categoryMultiplier * streakBonus)
  );
}

async function handleBossVictory({
  tx,
  userId,
  boss,
  progressId,
}: {
  tx: Prisma.TransactionClient;
  userId: string;
  boss: BossWithReward;
  progressId: number;
}) {
  await tx.userBossProgress.update({
    where: { id: progressId },
    data: {
      status: BossProgressStatus.VICTORIOUS,
      currentHp: 0,
      defeatedAt: now(),
      lastDamagedAt: now(),
    },
  });

  const profile = await tx.profile.findUnique({ where: { userId } });
  if (!profile) {
    return null;
  }

  const totalExp = profile.exp + boss.rewardExp;
  const levelProgress = calculateLevelFromTotalExp(totalExp);

  const nextBoss = await findNextBoss(tx, boss.id);

  const updatedProfile = await tx.profile.update({
    where: { userId },
    data: {
      exp: totalExp,
      level: levelProgress.level,
      coins: { increment: boss.rewardCoins },
      currentBossId: nextBoss?.id ?? null,
    },
  });

  if (boss.rewardItemId) {
    await tx.userInventory.upsert({
      where: {
        userId_itemId: {
          userId,
          itemId: boss.rewardItemId,
        },
      },
      create: {
        userId,
        itemId: boss.rewardItemId,
        quantity: 1,
      },
      update: {
        quantity: { increment: 1 },
      },
    });
  }

  await tx.activityLog.create({
    data: {
      userId,
      type: ActivityType.BOSS_DEFEATED,
      description: `Defeated ${boss.name}`,
      metadata: {
        bossId: boss.id,
        rewardExp: boss.rewardExp,
        rewardCoins: boss.rewardCoins,
        rewardItemId: boss.rewardItemId,
      },
    },
  });

  if (nextBoss) {
    await ensureUserBossProgress(tx, userId, nextBoss);
  }

  return { updatedProfile, nextBoss, levelProgress };
}

export async function applyBossDamage(
  context: BossDamageContext
): Promise<{ summary: BossBattleSummary; profile: ProfileWithBoss } | null> {
  const { tx, userId, profile, expReward, statIncreases, streak, level, taskCategory, taskDifficulty } =
    context;

  const profileRecord = profile ?? (await assignInitialBoss(tx, userId));

  if (!profileRecord?.currentBoss) {
    return null;
  }

  const boss = profileRecord.currentBoss as BossWithReward;
  const progress = await ensureUserBossProgress(tx, userId, boss);

  const lastHit = progress.lastDamagedAt?.getTime() ?? 0;
  const diff = Date.now() - lastHit;
  const cooldownRemainingMs = Math.max(0, DAMAGE_COOLDOWN_MS - diff);

  if (cooldownRemainingMs > 0) {
    return {
      summary: {
        boss,
        progress,
        cooldownRemainingMs,
        damageWindowMs: DAMAGE_WINDOW_MS,
        damageApplied: 0,
        defeated: false,
        percentageRemaining: Math.round((progress.currentHp / boss.maxHp) * 100),
      },
      profile: profileRecord,
    };
  }

  const damage = calculateDamage({
    expReward,
    statIncreases,
    streak,
    level,
    taskDifficulty,
    categoryMultiplier: weaknessMultiplier(boss, taskCategory),
  });

  const nextHp = Math.max(0, progress.currentHp - damage);

  const updatedProgress = await tx.userBossProgress.update({
    where: { id: progress.id },
    data: {
      currentHp: nextHp,
      lastDamagedAt: now(),
      status: nextHp === 0 ? BossProgressStatus.VICTORIOUS : BossProgressStatus.ACTIVE,
    },
  });

  await tx.activityLog.create({
    data: {
      userId,
      type: ActivityType.CHALLENGE_PROGRESS,
      description: `Dealt ${damage} damage to ${boss.name}`,
      metadata: {
        bossId: boss.id,
        damage,
        remainingHp: nextHp,
      },
    },
  });

  if (nextHp === 0) {
    const victoryData = await handleBossVictory({ tx, userId, boss, progressId: progress.id });
    const finalProfile = victoryData?.updatedProfile
      ? await tx.profile.findUnique({
          where: { userId },
          include: { currentBoss: { include: { rewardItem: true } } },
        })
      : profileRecord;

    return {
      summary: {
        boss,
        progress: updatedProgress,
        cooldownRemainingMs: 0,
        damageWindowMs: DAMAGE_WINDOW_MS,
        damageApplied: damage,
        defeated: true,
        rewards: {
          exp: boss.rewardExp,
          coins: boss.rewardCoins,
          item: boss.rewardItem ?? null,
        },
        percentageRemaining: 0,
      },
      profile: finalProfile ?? profileRecord,
    };
  }

  const finalProfile = await tx.profile.findUnique({
    where: { userId },
    include: { currentBoss: { include: { rewardItem: true } } },
  });

  return {
    summary: {
      boss,
      progress: updatedProgress,
      cooldownRemainingMs: 0,
      damageWindowMs: DAMAGE_WINDOW_MS,
      damageApplied: damage,
      defeated: false,
      percentageRemaining: Math.round((nextHp / boss.maxHp) * 100),
    },
    profile: finalProfile ?? profileRecord,
  };
}

export async function getBossBattleState(userId: string): Promise<BossBattleState> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { currentBoss: { include: { rewardItem: true } } },
  });

  const boss = profile?.currentBoss ?? null;

  if (!boss) {
    return {
      boss: null,
      progress: null,
      cooldownRemainingMs: 0,
      damageWindowMs: DAMAGE_WINDOW_MS,
      percentageRemaining: null,
    };
  }

  const progress = await prisma.userBossProgress.findUnique({
    where: {
      userId_bossId: {
        userId,
        bossId: boss.id,
      },
    },
  });

  const cooldownRemainingMs = progress?.lastDamagedAt
    ? Math.max(0, DAMAGE_COOLDOWN_MS - (Date.now() - progress.lastDamagedAt.getTime()))
    : 0;

  return {
    boss,
    progress,
    cooldownRemainingMs,
    damageWindowMs: DAMAGE_WINDOW_MS,
    percentageRemaining: progress ? Math.round((progress.currentHp / boss.maxHp) * 100) : null,
  };
}

export async function selectBossForUser(userId: string, bossId: number) {
  const boss = await prisma.boss.findFirst({
    where: { id: bossId, status: BossStatus.ACTIVE },
    include: { rewardItem: true },
  });

  if (!boss) {
    throw new Error("Boss not found");
  }

  await prisma.profile.update({
    where: { userId },
    data: { currentBossId: boss.id },
  });

  await ensureUserBossProgress(prisma, userId, boss);

  return getBossBattleState(userId);
}

export { DAMAGE_COOLDOWN_MS, DAMAGE_WINDOW_MS };
