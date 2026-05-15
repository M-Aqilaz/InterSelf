import { Prisma, Profile, Stat, TaskCompletionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LEVEL_BASE_EXP = 500;
const LEVEL_GROWTH = 1.2;

export type LevelProgress = {
  level: number;
  expIntoLevel: number;
  expForNextLevel: number;
  totalExp: number;
};

export type TaskCompletionResult = {
  completion: Prisma.TaskCompletionGetPayload<{ include: { task: true } }>;
  profile: Profile;
  stats: Stat[];
  levelProgress: LevelProgress;
};

export class TaskProgressionError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

export function calculateLevelFromTotalExp(totalExp: number): LevelProgress {
  let level = 1;
  let expForNextLevel = LEVEL_BASE_EXP;
  let expIntoLevel = totalExp;

  while (expIntoLevel >= expForNextLevel) {
    expIntoLevel -= expForNextLevel;
    level += 1;
    expForNextLevel = Math.floor(expForNextLevel * LEVEL_GROWTH);
  }

  return {
    level,
    expIntoLevel,
    expForNextLevel,
    totalExp,
  };
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

    const profile = await tx.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new TaskProgressionError("Profile not found", 404);
    }

    const expReward = Math.max(task.expReward, 0);
    const coinReward = Math.max(task.coinReward, 0);
    const streakGain = Math.max(task.streakImpact, 0);

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

    const nextTotalExp = profile.exp + expReward;
    const streak = profile.streak + streakGain;
    const bestStreak = Math.max(profile.bestStreak, streak);
    const totalCompletedTasks = profile.totalCompletedTasks + 1;

    const levelProgress = calculateLevelFromTotalExp(nextTotalExp);

    const updatedProfile = await tx.profile.update({
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

    return {
      completion,
      profile: updatedProfile,
      stats,
      levelProgress,
    };
  });
}
