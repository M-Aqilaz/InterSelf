import {
  ActivityType,
  BossProgressStatus,
  BossStatus,
  Prisma,
  TaskCategory,
  TaskDifficulty,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GameError } from "@/lib/errors";
import { GEMS_REWARDS } from "@/lib/gems";
import { grantRewards } from "@/lib/rewards";
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
  source?: string;
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
  const progress = await client.userBossProgress.upsert({
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

  // A boss that comes back around after being defeated is a fresh fight. Without this
  // it would stay at 0 HP and pay out its victory rewards again on every single hit.
  if (progress.status === BossProgressStatus.VICTORIOUS) {
    return client.userBossProgress.update({
      where: { id: progress.id },
      data: {
        currentHp: boss.maxHp,
        status: BossProgressStatus.ACTIVE,
        defeatedAt: null,
        lastDamagedAt: null,
      },
    });
  }

  return progress;
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

function buildDamageMeta(boss: BossWithReward, taskCategory: TaskCategory, taskDifficulty: TaskDifficulty) {
  const weaknessTriggered = boss.weakness === taskCategory;
  const categoryMultiplier = weaknessMultiplier(boss, taskCategory);

  return {
    taskCategory,
    taskDifficulty,
    weaknessTriggered,
    categoryMultiplier,
  };
}

export async function handleBossVictory({
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

  const nextBoss = await findNextBoss(tx, boss.id);

  const { profile: updatedProfile, levelProgress } = await grantRewards(tx, userId, {
    exp: boss.rewardExp,
    coins: boss.rewardCoins,
    gems: GEMS_REWARDS.BOSS_DEFEAT,
    data: { currentBoss: nextBoss ? { connect: { id: nextBoss.id } } : { disconnect: true } },
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

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.ITEM_EARNED,
        description: `Looted ${boss.rewardItem?.name ?? "boss reward"}`,
        metadata: {
          bossId: boss.id,
          itemId: boss.rewardItemId,
        },
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
  const { tx, userId, profile, expReward, statIncreases, streak, level, taskCategory, taskDifficulty, source } =
    context;

  const profileRecord = profile ?? (await assignInitialBoss(tx, userId));

  if (!profileRecord?.currentBoss) {
    return null;
  }

  const boss = profileRecord.currentBoss as BossWithReward;
  const progress = await ensureUserBossProgress(tx, userId, boss);
  const damageMeta = buildDamageMeta(boss, taskCategory, taskDifficulty);

  const lastHit = progress.lastDamagedAt?.getTime() ?? 0;
  const diff = Date.now() - lastHit;
  const cooldownRemainingMs = Math.max(0, DAMAGE_COOLDOWN_MS - diff);

  let blocked = cooldownRemainingMs > 0;
  if (!blocked) {
    // Claim the hit atomically so two simultaneous requests cannot both land inside one cooldown.
    const claim = await tx.userBossProgress.updateMany({
      where: {
        id: progress.id,
        status: BossProgressStatus.ACTIVE,
        OR: [
          { lastDamagedAt: null },
          { lastDamagedAt: { lte: new Date(Date.now() - DAMAGE_COOLDOWN_MS) } },
        ],
      },
      data: { lastDamagedAt: now() },
    });
    blocked = claim.count === 0;
  }

  if (blocked) {
    return {
      summary: {
        boss,
        progress,
        cooldownRemainingMs: cooldownRemainingMs || DAMAGE_COOLDOWN_MS,
        damageWindowMs: DAMAGE_WINDOW_MS,
        damageApplied: 0,
        defeated: false,
        source,
        taskCategory,
        taskDifficulty,
        weaknessTriggered: damageMeta.weaknessTriggered,
        damageMultiplier: damageMeta.categoryMultiplier,
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
    categoryMultiplier: damageMeta.categoryMultiplier,
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
        source,
        taskCategory,
        taskDifficulty,
        weaknessTriggered: damageMeta.weaknessTriggered,
        damageMultiplier: damageMeta.categoryMultiplier,
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
        source,
        taskCategory,
        taskDifficulty,
        weaknessTriggered: damageMeta.weaknessTriggered,
        damageMultiplier: damageMeta.categoryMultiplier,
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
      source,
      taskCategory,
      taskDifficulty,
      weaknessTriggered: damageMeta.weaknessTriggered,
      damageMultiplier: damageMeta.categoryMultiplier,
      percentageRemaining: Math.round((nextHp / boss.maxHp) * 100),
    },
    profile: finalProfile ?? profileRecord,
  };
}

/**
 * Flat damage to the user's current boss that ignores the hit cooldown (Boss Orb).
 * A killing blow pays out the same victory rewards as a normal hit.
 */
export async function applyFlatBossDamage(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number
): Promise<{ applied: boolean; message: string }> {
  const profile = await tx.profile.findUnique({
    where: { userId },
    include: { currentBoss: { include: { rewardItem: true } } },
  });
  const boss = profile?.currentBoss as BossWithReward | null | undefined;
  if (!boss) {
    return { applied: false, message: "Tidak ada boss aktif" };
  }

  const progress = await ensureUserBossProgress(tx, userId, boss);
  const nextHp = Math.max(0, progress.currentHp - amount);

  await tx.userBossProgress.update({
    where: { id: progress.id },
    data: { currentHp: nextHp, lastDamagedAt: now() },
  });

  if (nextHp === 0) {
    await handleBossVictory({ tx, userId, boss, progressId: progress.id });
    return { applied: true, message: "Boss terkena -" + amount + " DMG dan dikalahkan!" };
  }

  return { applied: true, message: "Boss terkena -" + amount + " DMG! HP tersisa: " + nextHp };
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
    throw new GameError("Boss not found", 404);
  }

  const profile = await prisma.profile.findUnique({ where: { userId }, select: { level: true } });
  if (!profile) {
    throw new GameError("Profile not found", 404);
  }
  if (profile.level < boss.minLevel) {
    throw new GameError("This dungeon unlocks at level " + boss.minLevel, 403);
  }

  await prisma.profile.update({
    where: { userId },
    data: { currentBossId: boss.id },
  });

  await ensureUserBossProgress(prisma, userId, boss);

  return getBossBattleState(userId);
}

export { DAMAGE_COOLDOWN_MS, DAMAGE_WINDOW_MS };
