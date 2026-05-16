import { Achievement, ActivityType, Prisma, Stat, UserAchievement } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";
import type { ProfileWithBoss } from "@/lib/boss";

export type AchievementUnlock = {
  id: number;
  name: string;
  rewardExp: number;
  rewardCoins: number;
};

type AchievementWithStatus = Achievement & {
  status: "locked" | "unlocked" | "claimed";
  claimable: boolean;
  unlockedAt: Date | null;
  claimedAt: Date | null;
};

type AchievementContext = {
  tx: Prisma.TransactionClient;
  userId: string;
  profile: ProfileWithBoss;
  stats: Stat[];
  inventorySummary?: {
    totalItems: number;
    legendaryEquipped: boolean;
  };
  bossVictory?: boolean;
};

type UserAchievementWithAchievement = UserAchievement & {
  claimedAt: Date | null;
  achievement: Achievement;
};

const ACHIEVEMENT_NAMES = {
  INITIATE: "Awakened Initiate",
  MOMENTUM: "Momentum Architect",
  VOID_RUNNER: "Void Runner",
  PRIME_VANGUARD: "Prime Vanguard",
  VAULT_KEEPER: "Vault Keeper",
  RELIC_MASTER: "Relic Master",
} as const;

type AchievementRule = {
  name: string;
  check: (ctx: AchievementContext) => Promise<boolean>;
};

const rules: AchievementRule[] = [
  {
    name: ACHIEVEMENT_NAMES.INITIATE,
    check: async (ctx) => ctx.profile.totalCompletedTasks >= 1,
  },
  {
    name: ACHIEVEMENT_NAMES.MOMENTUM,
    check: async (ctx) => ctx.profile.bestStreak >= 7,
  },
  {
    name: ACHIEVEMENT_NAMES.VOID_RUNNER,
    check: async (ctx) => {
      const count = await ctx.tx.taskCompletion.count({
        where: {
          userId: ctx.userId,
          task: { title: "Deep Work Sprint" },
        },
      });
      return count >= 3;
    },
  },
  {
    name: ACHIEVEMENT_NAMES.PRIME_VANGUARD,
    check: async (ctx) => Boolean(ctx.bossVictory),
  },
  {
    name: ACHIEVEMENT_NAMES.VAULT_KEEPER,
    check: async (ctx) => (ctx.inventorySummary?.totalItems ?? 0) >= 3,
  },
  {
    name: ACHIEVEMENT_NAMES.RELIC_MASTER,
    check: async (ctx) => ctx.inventorySummary?.legendaryEquipped === true,
  },
];

export async function evaluateAchievements(
  context: AchievementContext
): Promise<AchievementUnlock[] | null> {
  const names = rules.map((rule) => rule.name);
  const [achievements, userAchievements] = await Promise.all([
    context.tx.achievement.findMany({ where: { name: { in: names } } }),
    context.tx.userAchievement.findMany({
      where: {
        userId: context.userId,
        achievement: {
          name: { in: names },
        },
      },
      include: { achievement: true },
    }),
  ]);

  const achievementsByName = new Map(achievements.map((ach) => [ach.name, ach]));
  const unlockedNames = new Set(userAchievements.map((ua) => ua.achievement.name));

  const unlocked: AchievementUnlock[] = [];

  for (const rule of rules) {
    const achievement = achievementsByName.get(rule.name);
    if (!achievement) continue;
    if (unlockedNames.has(achievement.name)) continue;

    const passes = await rule.check(context);
    if (!passes) {
      continue;
    }

    await context.tx.userAchievement.create({
      data: {
        userId: context.userId,
        achievementId: achievement.id,
      },
    });

    unlocked.push({
      id: achievement.id,
      name: achievement.name,
      rewardExp: achievement.rewardExp,
      rewardCoins: achievement.rewardCoins,
    });

    await context.tx.activityLog.create({
      data: {
        userId: context.userId,
        type: ActivityType.ACHIEVEMENT_UNLOCKED,
        description: `Unlocked ${achievement.name}`,
        metadata: {
          achievementId: achievement.id,
          rewardExp: achievement.rewardExp,
          rewardCoins: achievement.rewardCoins,
        },
      },
    });
  }

  if (unlocked.length === 0) {
    return null;
  }

  return unlocked;
}

export async function claimAchievementReward(userId: string, achievementId: number) {
  return prisma.$transaction(async (tx) => {
    const record = (await tx.userAchievement.findFirst({
      where: { userId, achievementId },
      include: { achievement: true },
    })) as UserAchievementWithAchievement | null;

    if (!record || !record.achievement) {
      throw new Error("Achievement not found");
    }

    if (record.claimedAt) {
      throw new Error("Reward already claimed");
    }

    const profile = await tx.profile.findUnique({
      where: { userId },
      include: { currentBoss: { include: { rewardItem: true } } },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    const totalExp = profile.exp + record.achievement.rewardExp;
    const levelProgress = calculateLevelFromTotalExp(totalExp);

    const updatedProfile = await tx.profile.update({
      where: { userId },
      data: {
        exp: totalExp,
        level: levelProgress.level,
        coins: { increment: record.achievement.rewardCoins },
      },
      include: { currentBoss: { include: { rewardItem: true } } },
    });

    await tx.userAchievement.update({
      where: { id: record.id },
      data: { claimedAt: new Date() },
    });

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.ACHIEVEMENT_UNLOCKED,
        description: `Claimed ${record.achievement.name}`,
        metadata: {
          achievementId: record.achievementId,
          rewardExp: record.achievement.rewardExp,
          rewardCoins: record.achievement.rewardCoins,
        },
      },
    });

    return {
      profile: updatedProfile,
      levelProgress,
      reward: {
        exp: record.achievement.rewardExp,
        coins: record.achievement.rewardCoins,
      },
    };
  });
}

export async function listAchievementsForUser(userId: string): Promise<AchievementWithStatus[]> {
  const [achievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { id: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  const userMap = new Map(userAchievements.map((record) => [record.achievementId, record]));

  return achievements.map((achievement) => {
    const progress = userMap.get(achievement.id);
    const claimedAt = progress ? (progress as UserAchievementWithAchievement).claimedAt ?? null : null;
    const unlockedAt = progress?.unlockedAt ?? null;

    let status: AchievementWithStatus["status"] = "locked";
    let claimable = false;

    if (claimedAt) {
      status = "claimed";
    } else if (progress) {
      status = "unlocked";
      claimable = true;
    }

    return {
      ...achievement,
      status,
      claimable,
      unlockedAt,
      claimedAt,
    };
  });
}
