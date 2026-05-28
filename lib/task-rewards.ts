import { TaskCategory, TaskDifficulty } from "@prisma/client";

const DIFFICULTY_REWARDS: Record<TaskDifficulty, { expReward: number; coinReward: number; streakImpact: number }> = {
  EASY: { expReward: 25, coinReward: 10, streakImpact: 1 },
  MEDIUM: { expReward: 60, coinReward: 25, streakImpact: 1 },
  HARD: { expReward: 110, coinReward: 45, streakImpact: 2 },
  LEGENDARY: { expReward: 180, coinReward: 80, streakImpact: 3 },
};

const CATEGORY_REWARD_BONUS: Partial<Record<TaskCategory, { expReward?: number; coinReward?: number }>> = {
  FOCUS: { expReward: 10 },
  STUDY: { expReward: 10 },
  WORKOUT: { expReward: 5 },
  SAVE_MONEY: { coinReward: 15 },
  WAKE_UP: { expReward: 5, coinReward: 5 },
};

export function resolveTaskRewards(category: TaskCategory, difficulty: TaskDifficulty) {
  const base = DIFFICULTY_REWARDS[difficulty];
  const bonus = CATEGORY_REWARD_BONUS[category] ?? {};

  return {
    expReward: base.expReward + (bonus.expReward ?? 0),
    coinReward: base.coinReward + (bonus.coinReward ?? 0),
    streakImpact: base.streakImpact,
  };
}
