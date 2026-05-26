import { prisma } from "@/lib/prisma";

// Gems earned from various sources
export const GEMS_REWARDS = {
  ACHIEVEMENT_COMMON: 10,
  ACHIEVEMENT_RARE: 25,
  ACHIEVEMENT_EPIC: 50,
  ACHIEVEMENT_LEGENDARY: 100,
  BOSS_DEFEAT: 30,
  WEEKLY_CHALLENGE: 20,
  STREAK_MILESTONE: 15, // every 7-day streak
};

export async function grantGems(userId: string, amount: number, reason: string) {
  const updated = await prisma.profile.update({
    where: { userId },
    data: { gems: { increment: amount } },
  });
  return { gems: updated.gems, granted: amount, reason };
}

export async function spendGems(userId: string, amount: number) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { gems: true } });
  if (!profile || profile.gems < amount) {
    throw new Error("Not enough gems");
  }
  const updated = await prisma.profile.update({
    where: { userId },
    data: { gems: { decrement: amount } },
  });
  return { gems: updated.gems };
}

// Refresh energy using gems (cost: 50 gems per energy)
export const GEMS_PER_ENERGY = 50;

export async function refreshEnergyWithGems(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { gems: true, energy: true, energyMax: true },
  });
  if (!profile) throw new Error("Profile not found");
  if (profile.energy >= profile.energyMax) throw new Error("Energy already full");
  if (profile.gems < GEMS_PER_ENERGY) throw new Error(`Need ${GEMS_PER_ENERGY} gems`);

  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      gems: { decrement: GEMS_PER_ENERGY },
      energy: { increment: 1 },
    },
  });
  return { gems: updated.gems, energy: updated.energy };
}
