import { Prisma, Stat, TaskCompletionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp, type LevelProgress } from "@/lib/level";
import { applyBossDamage, type ProfileWithBoss } from "@/lib/boss";
import { applyPassiveEffects, summarizeInventory } from "@/lib/inventory";
import { evaluateAchievements, type AchievementUnlock } from "@/lib/achievements";
import { recordWeeklyChallengeProgress } from "@/lib/challenges";
import type { BossBattleSummary } from "@/types/boss";
import { startOfToday } from "@/lib/time";
import { getClassPassiveMultipliers } from "@/lib/classes";
import type { CharacterClass } from "@prisma/client";

export type TaskCompletionResult = {
  completion: Prisma.TaskCompletionGetPayload<{ include: { task: true } }>;
  profile: ProfileWithBoss;
  stats: Stat[];
  levelProgress: LevelProgress;
  bossBattle?: BossBattleSummary | null;
  achievements?: AchievementUnlock[] | null;
  passiveLogs?: string[];
};

export class TaskProgressionError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

export async function completeTaskForUser({
  userId,
  taskId,
}: {
  userId: string;
  taskId: number;
}): Promise<TaskCompletionResult> {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { statRewards: true },
    });

    if (!task) {
      throw new TaskProgressionError("Task not found", 404);
    }

    if (!task.isSystem && task.createdById !== userId) {
      throw new TaskProgressionError("You do not have access to this task", 403);
    }

    if (task.isSystem) {
      const today = startOfToday();
      const alreadyCompleted = await tx.taskCompletion.findFirst({
        where: {
          userId,
          taskId,
          completedAt: { gte: today },
        },
      });

      if (alreadyCompleted) {
        throw new TaskProgressionError("System tasks can only be completed once per day", 409);
      }
    }

    const profile = await tx.profile.findUnique({
      where: { userId },
      include: { currentBoss: { include: { rewardItem: true } } },
    });

    if (!profile) {
      throw new TaskProgressionError("Profile not found", 404);
    }

    await applyStreakProtection(tx, userId, profile);

    const baseExpReward = Math.max(task.expReward, 0);
    const baseCoinReward = Math.max(task.coinReward, 0);
    const streakGain = Math.max(task.streakImpact, 0);

    // === CLASS PASSIVE BONUS ===
    const characterClass = (profile as ProfileWithBoss & { characterClass?: CharacterClass | null }).characterClass;
    const classMultipliers = characterClass
      ? getClassPassiveMultipliers(
          characterClass,
          task.category,
          task.difficulty
        )
      : { expMultiplier: 1, coinMultiplier: 1 };

    const baseExpRewardWithClass = Math.round(baseExpReward * classMultipliers.expMultiplier);
    const baseCoinRewardWithClass = Math.round(baseCoinReward * classMultipliers.coinMultiplier);

    const statIncreases: Record<string, number> = {};

    await Promise.all(
      task.statRewards.map((reward) => {
        if (reward.amount === 0) {
          return Promise.resolve();
        }

        statIncreases[reward.stat] = (statIncreases[reward.stat] ?? 0) + reward.amount;

        return tx.stat.upsert({
          where: {
            userId_type: {
              userId,
              type: reward.stat,
            },
          },
          create: {
            userId,
            type: reward.stat,
            value: reward.amount,
          },
          update: {
            value: {
              increment: reward.amount,
            },
          },
        });
      })
    );

    const passiveResult = await applyPassiveEffects(tx, userId, {
      expReward: baseExpRewardWithClass,
      coinReward: baseCoinRewardWithClass,
      taskCategory: task.category,
    });

    // Cek streak debuff
    const streakDebuffActive = await checkStreakDebuff(tx, userId, profile);
    const expReward = streakDebuffActive
      ? Math.round(passiveResult.expReward * 0.8)
      : passiveResult.expReward;
    const coinReward = passiveResult.coinReward;

    const nextTotalExp = profile.exp + expReward;
    const streak = profile.streak + streakGain;
    const bestStreak = Math.max(profile.bestStreak, streak);
    const totalCompletedTasks = profile.totalCompletedTasks + 1;

    const levelProgress = calculateLevelFromTotalExp(nextTotalExp);

    await tx.profile.update({
      where: { userId },
      data: {
        exp: nextTotalExp,
        level: levelProgress.level,
        coins: { increment: coinReward },
        streak,
        bestStreak,
        totalCompletedTasks,
      },
    });

    const completion = await tx.taskCompletion.create({
      data: {
        taskId: task.id,
        userId,
        status: TaskCompletionStatus.COMPLETED,
        expEarned: expReward,
        coinsEarned: coinReward,
        streakCount: streak,
        statIncreases: statIncreases as Prisma.JsonObject,
      },
      include: { task: true },
    });

    const stats = await tx.stat.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });

    let bossBattle: BossBattleSummary | null = null;
    let profileWithBoss: ProfileWithBoss | null = null;

    const bossResult = await applyBossDamage({
      tx,
      userId,
      profile,
      expReward,
      statIncreases,
      streak,
      level: levelProgress.level,
      taskCategory: task.category,
      taskDifficulty: task.difficulty,
    });

    if (bossResult) {
      bossBattle = bossResult.summary;
      profileWithBoss = bossResult.profile;
    } else {
      profileWithBoss = await tx.profile.findUnique({
        where: { userId },
        include: { currentBoss: { include: { rewardItem: true } } },
      });
    }

    if (!profileWithBoss) {
      throw new TaskProgressionError("Unable to load profile after task completion", 500);
    }

    const achievementResult = await evaluateAchievements({
      tx,
      userId,
      profile: profileWithBoss,
      stats,
      inventorySummary: summarizeInventory(passiveResult.inventory),
      bossVictory: bossBattle?.defeated,
    });

    let achievements: AchievementUnlock[] | null = null;

    if (achievementResult) {
      achievements = achievementResult;
    }

    await recordWeeklyChallengeProgress(tx, userId, task.title);

    return {
      completion,
      profile: profileWithBoss,
      stats,
      levelProgress,
      bossBattle,
      achievements,
      passiveLogs: passiveResult.passiveLogs,
    };
  });
}

async function checkStreakDebuff(
  tx: Prisma.TransactionClient,
  userId: string,
  profile: ProfileWithBoss
): Promise<boolean> {
  if (profile.streak > 0) return false;

  const now = new Date();
  const profileWithShield = profile as ProfileWithBoss & { streakShieldExpiry?: Date | null; streakShieldActive?: boolean };
  const shieldExpiry = profileWithShield.streakShieldExpiry ?? null;
  const shieldActive = profileWithShield.streakShieldActive ?? false;

  if (shieldActive && shieldExpiry && shieldExpiry > now) return false;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const completedYesterday = await tx.taskCompletion.count({
    where: {
      userId,
      completedAt: { gte: yesterday },
    },
  });

  return completedYesterday === 0;
}

async function applyStreakProtection(
  tx: Prisma.TransactionClient,
  userId: string,
  profile: { streak: number; bestStreak: number; characterClass?: CharacterClass | null }
): Promise<void> {
  if (profile.characterClass !== "PHANTOM") return;
  if (profile.streak > 0) return;
  if (profile.bestStreak <= 0) return;

  const protectedStreak = Math.floor(profile.bestStreak * 0.5);
  if (protectedStreak <= 0) return;

  await tx.profile.update({
    where: { userId },
    data: { streak: protectedStreak },
  });
}
