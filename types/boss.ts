import type { Boss, InventoryItem, UserBossProgress } from "@prisma/client";

export type BossWithReward = Boss & { rewardItem?: InventoryItem | null };

export type BossBattleState = {
  boss: BossWithReward | null;
  progress: UserBossProgress | null;
  cooldownRemainingMs: number;
  damageWindowMs: number;
  percentageRemaining: number | null;
};

export type BossBattleSummary = BossBattleState & {
  damageApplied: number;
  defeated: boolean;
  source?: string;
  taskCategory?: string;
  taskDifficulty?: string;
  weaknessTriggered?: boolean;
  damageMultiplier?: number;
  rewards?: {
    exp: number;
    coins: number;
    item?: InventoryItem | null;
  };
};
