import { AchievementRarity } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GameError } from "@/lib/errors";
import { syncEnergy } from "@/lib/energy";

// Gems earned from various sources
export const GEMS_REWARDS = {
  ACHIEVEMENT_COMMON: 10,
  ACHIEVEMENT_RARE: 25,
  ACHIEVEMENT_EPIC: 50,
  ACHIEVEMENT_LEGENDARY: 100,
  ACHIEVEMENT_MYTHIC: 200,
  BOSS_DEFEAT: 30,
  WEEKLY_CHALLENGE: 20,
  STREAK_MILESTONE: 15, // every 7-day streak
};

export function gemsForAchievement(rarity: AchievementRarity) {
  switch (rarity) {
    case AchievementRarity.COMMON:
      return GEMS_REWARDS.ACHIEVEMENT_COMMON;
    case AchievementRarity.RARE:
      return GEMS_REWARDS.ACHIEVEMENT_RARE;
    case AchievementRarity.EPIC:
      return GEMS_REWARDS.ACHIEVEMENT_EPIC;
    case AchievementRarity.LEGENDARY:
      return GEMS_REWARDS.ACHIEVEMENT_LEGENDARY;
    case AchievementRarity.MYTHIC:
      return GEMS_REWARDS.ACHIEVEMENT_MYTHIC;
  }
}

/** Atomic: the balance check and the deduction are one statement, so it can never go negative. */
export async function spendGems(userId: string, amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) throw new GameError("Invalid amount");

  const result = await prisma.profile.updateMany({
    where: { userId, gems: { gte: amount } },
    data: { gems: { decrement: amount } },
  });
  if (result.count === 0) throw new GameError("Not enough gems");

  const profile = await prisma.profile.findUnique({ where: { userId }, select: { gems: true } });
  return { gems: profile?.gems ?? 0 };
}

// Refresh energy using gems (cost: 50 gems per energy)
export const GEMS_PER_ENERGY = 50;

export async function refreshEnergyWithGems(userId: string) {
  return prisma.$transaction(async (tx) => {
    const current = await syncEnergy(userId, tx);
    if (current.energy >= current.energyMax) throw new GameError("Energy already full");

    const result = await tx.profile.updateMany({
      where: {
        userId,
        gems: { gte: GEMS_PER_ENERGY },
        energy: current.energy,
      },
      data: {
        gems: { decrement: GEMS_PER_ENERGY },
        energy: { increment: 1 },
      },
    });
    if (result.count === 0) throw new GameError(`Need ${GEMS_PER_ENERGY} gems`);

    const updated = await tx.profile.findUniqueOrThrow({
      where: { userId },
      select: { gems: true, energy: true },
    });
    return { gems: updated.gems, energy: updated.energy };
  });
}
