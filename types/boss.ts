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
  rewards?: {
    exp: number;
    coins: number;
    item?: InventoryItem | null;
  };
};
