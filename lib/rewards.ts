import { ActivityType, Prisma } from "@prisma/client";
import { calculateLevelFromTotalExp, type LevelProgress } from "@/lib/level";

type GrantInput = {
  exp?: number;
  coins?: number;
  gems?: number;
  /** Extra profile columns to update in the same statement. */
  data?: Prisma.ProfileUpdateInput;
};

/**
 * Add exp/coins/gems with atomic increments (no lost updates under concurrency),
 * then keep `level` in sync with total exp and log level-ups.
 */
export async function grantRewards(
  tx: Prisma.TransactionClient,
  userId: string,
  { exp = 0, coins = 0, gems = 0, data = {} }: GrantInput
): Promise<{ profile: Prisma.ProfileGetPayload<object>; levelProgress: LevelProgress; leveledUp: boolean }> {
  let profile = await tx.profile.update({
    where: { userId },
    data: {
      ...data,
      ...(exp ? { exp: { increment: exp } } : {}),
      ...(coins ? { coins: { increment: coins } } : {}),
      ...(gems ? { gems: { increment: gems } } : {}),
    },
  });

  const levelProgress = calculateLevelFromTotalExp(profile.exp);
  const leveledUp = levelProgress.level > profile.level;

  if (levelProgress.level !== profile.level) {
    profile = await tx.profile.update({
      where: { userId },
      data: { level: levelProgress.level },
    });
  }

  if (leveledUp) {
    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.LEVEL_UP,
        description: `Reached level ${levelProgress.level}`,
        metadata: { level: levelProgress.level },
      },
    });
  }

  return { profile, levelProgress, leveledUp };
}
