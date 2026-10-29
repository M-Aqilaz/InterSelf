import { Prisma, Stat, TaskCompletionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp, type LevelProgress } from "@/lib/level";
import { applyBossDamage, type ProfileWithBoss } from "@/lib/boss";
import { applyPassiveEffects, summarizeInventory } from "@/lib/inventory";
import { evaluateAchievements, type AchievementUnlock } from "@/lib/achievements";
import { recordWeeklyChallengeProgress } from "@/lib/challenges";
import type { BossBattleSummary } from "@/types/boss";
import { dayKey, startOfToday } from "@/lib/time";
import { getClassPassiveMultipliers } from "@/lib/classes";
import { GameError } from "@/lib/errors";
import { GEMS_REWARDS } from "@/lib/gems";
import { grantRewards } from "@/lib/rewards";
import { advanceStreak, STREAK_DEBUFF_MULTIPLIER } from "@/lib/streak";

/** Multiplier applied to exp / coins while an XP Surge / Coin Magnet is active. */
const ITEM_BOOST_MULTIPLIER = 1.5;

export type TaskCompletionResult = {
  completion: Prisma.TaskCompletionGetPayload<{ include: { task: true } }>;
  profile: ProfileWithBoss;
  stats: Stat[];
  levelProgress: LevelProgress;
  bossBattle?: BossBattleSummary | null;
  achievements?: AchievementUnlock[] | null;
  passiveLogs?: string[];
};

export class TaskProgressionError extends GameError {}

export async function completeTaskForUser({
  userId,
  taskId,
}: {
  userId: string;
  taskId: number;
}): Promise<TaskCompletionResult> {
  try {
    return await prisma.$transaction((tx) => runTaskCompletion(tx, userId, taskId));
  } catch (error) {
    // The (userId, taskId, completedDay) unique index is the final guard against
    // two simultaneous requests both completing the same task today.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new TaskProgressionError("Task already completed today", 409);
    }
    throw error;
  }
}

async function runTaskCompletion(
  tx: Prisma.TransactionClient,
  userId: string,
  taskId: number
): Promise<TaskCompletionResult> {
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

  const now = new Date();
  const today = startOfToday(now);
  const todayKey = dayKey(now);

  const alreadyCompleted = await tx.taskCompletion.findFirst({
    where: {
      userId,
      taskId,
      OR: [{ completedDay: todayKey }, { completedAt: { gte: today } }],
    },
    select: { id: true },
  });

  if (alreadyCompleted) {
    throw new TaskProgressionError("Task already completed today", 409);
  }

  const profile = await tx.profile.findUnique({
    where: { userId },
    include: { currentBoss: { include: { rewardItem: true } } },
  });

  if (!profile) {
    throw new TaskProgressionError("Profile not found", 404);
  }

  // === STREAK (consecutive days with at least one completed task) ===
  const streakOutcome = advanceStreak(profile, now);

  // === CLASS PASSIVE BONUS ===
  const classMultipliers = profile.characterClass
    ? getClassPassiveMultipliers(profile.characterClass, task.category, task.difficulty)
    : { expMultiplier: 1, coinMultiplier: 1 };

  const baseExp = Math.round(Math.max(task.expReward, 0) * classMultipliers.expMultiplier);
  const baseCoins = Math.round(Math.max(task.coinReward, 0) * classMultipliers.coinMultiplier);

  const statIncreases: Record<string, number> = {};
  for (const reward of task.statRewards) {
    if (reward.amount === 0) continue;

    statIncreases[reward.stat] = (statIncreases[reward.stat] ?? 0) + reward.amount;

    await tx.stat.upsert({
      where: { userId_type: { userId, type: reward.stat } },
      create: { userId, type: reward.stat, value: reward.amount },
      update: { value: { increment: reward.amount } },
    });
  }

  const passiveResult = await applyPassiveEffects(tx, userId, {
    expReward: baseExp,
    coinReward: baseCoins,
    taskCategory: task.category,
  });

  const xpBoosted = profile.xpBoostUntil !== null && profile.xpBoostUntil > now;
  const coinBoosted = profile.coinBoostUntil !== null && profile.coinBoostUntil > now;

  let expReward = passiveResult.expReward;
  let coinReward = passiveResult.coinReward;
  const passiveLogs = [...passiveResult.passiveLogs];

  if (xpBoosted) {
    expReward = Math.round(expReward * ITEM_BOOST_MULTIPLIER);
    passiveLogs.push("XP Surge boosted EXP by 50%");
  }
  if (coinBoosted) {
    coinReward = Math.round(coinReward * ITEM_BOOST_MULTIPLIER);
    passiveLogs.push("Coin Magnet boosted coins by 50%");
  }
  if (streakOutcome.broke) {
    expReward = Math.round(expReward * STREAK_DEBUFF_MULTIPLIER);
    passiveLogs.push("Streak was broken: EXP reduced by 20% on this task");
  }
  if (streakOutcome.shieldConsumed) {
    passiveLogs.push("Streak Shield absorbed a missed day");
  }

  const { levelProgress: rewardLevelProgress } = await grantRewards(tx, userId, {
    exp: expReward,
    coins: coinReward,
    gems: streakOutcome.milestone ? GEMS_REWARDS.STREAK_MILESTONE : 0,
    data: {
      streak: streakOutcome.streak,
      bestStreak: streakOutcome.bestStreak,
      lastStreakDate: streakOutcome.lastStreakDate,
      totalCompletedTasks: { increment: 1 },
      ...(streakOutcome.shieldConsumed
        ? { streakShieldActive: false, streakShieldExpiry: null }
        : {}),
    },
  });

  const completion = await tx.taskCompletion.create({
    data: {
      taskId: task.id,
      userId,
      status: TaskCompletionStatus.COMPLETED,
      expEarned: expReward,
      coinsEarned: coinReward,
      streakCount: streakOutcome.streak,
      completedDay: todayKey,
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
    streak: streakOutcome.streak,
    level: rewardLevelProgress.level,
    taskCategory: task.category,
    taskDifficulty: task.difficulty,
    source: task.title,
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

  const achievements = await evaluateAchievements({
    tx,
    userId,
    profile: profileWithBoss,
    stats,
    inventorySummary: summarizeInventory(passiveResult.inventory),
    bossVictory: bossBattle?.defeated,
  });

  await recordWeeklyChallengeProgress(tx, userId, task.title);

  return {
    completion,
    profile: profileWithBoss,
    stats,
    // Boss rewards may have added exp after the task reward was granted.
    levelProgress: calculateLevelFromTotalExp(profileWithBoss.exp),
    bossBattle,
    achievements,
    passiveLogs,
  };
}
