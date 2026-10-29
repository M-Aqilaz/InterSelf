import { prisma } from "@/lib/prisma";
import { PvpChallengeMode, PvpChallengeStatus } from "@prisma/client";
import { grantRewards } from "@/lib/rewards";

export const CHALLENGE_DURATION_DAYS = 7;
export const CHALLENGE_REWARD_COINS = 150;
export const CHALLENGE_REWARD_EXP = 200;

// Hitung score user untuk periode challenge tertentu (aggregated in the database)
export async function calculateChallengeScore(
  userId: string,
  mode: PvpChallengeMode,
  startsAt: Date,
  endsAt: Date
): Promise<number> {
  const where = { userId, completedAt: { gte: startsAt, lte: endsAt } };

  switch (mode) {
    case PvpChallengeMode.TASK_COUNT:
      return prisma.taskCompletion.count({ where });
    case PvpChallengeMode.EXP_RACE: {
      const result = await prisma.taskCompletion.aggregate({ where, _sum: { expEarned: true } });
      return result._sum.expEarned ?? 0;
    }
    case PvpChallengeMode.STREAK_HOLD: {
      const result = await prisma.taskCompletion.aggregate({ where, _max: { streakCount: true } });
      return result._max.streakCount ?? 0;
    }
    default:
      return 0;
  }
}

// Resolve challenge yang sudah lewat endsAt
export async function resolveExpiredChallenges(userId: string) {
  const now = new Date();

  const expired = await prisma.pvpChallenge.findMany({
    where: {
      status: PvpChallengeStatus.ACTIVE,
      endsAt: { lte: now },
      OR: [{ challengerId: userId }, { challengedId: userId }],
    },
  });

  for (const challenge of expired) {
    if (!challenge.startsAt || !challenge.endsAt) continue;

    const [challengerScore, challengedScore] = await Promise.all([
      calculateChallengeScore(challenge.challengerId, challenge.mode, challenge.startsAt, challenge.endsAt),
      calculateChallengeScore(challenge.challengedId, challenge.mode, challenge.startsAt, challenge.endsAt),
    ]);

    const winnerId =
      challengerScore > challengedScore
        ? challenge.challengerId
        : challengedScore > challengerScore
        ? challenge.challengedId
        : null; // draw

    await prisma.$transaction(async (tx) => {
      // Only the request that flips ACTIVE -> COMPLETED pays the reward (no double payout).
      const resolved = await tx.pvpChallenge.updateMany({
        where: { id: challenge.id, status: PvpChallengeStatus.ACTIVE },
        data: {
          status: PvpChallengeStatus.COMPLETED,
          challengerScore,
          challengedScore,
          winnerId,
        },
      });
      if (resolved.count === 0 || !winnerId) return;

      await grantRewards(tx, winnerId, {
        exp: challenge.rewardExp,
        coins: challenge.rewardCoins,
      });

      await tx.activityLog.create({
        data: {
          userId: winnerId,
          type: "ITEM_EARNED",
          description: `Menang PvP Challenge! +${challenge.rewardCoins} coins +${challenge.rewardExp} EXP`,
          metadata: { challengeId: challenge.id, mode: challenge.mode },
        },
      });
    });
  }
}

// Ambil semua challenge user (aktif, pending, history)
export async function getUserChallenges(userId: string) {
  await resolveExpiredChallenges(userId);

  const challenges = await prisma.pvpChallenge.findMany({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      challenger: { select: { id: true, profile: { select: { username: true, level: true } } } },
      challenged: { select: { id: true, profile: { select: { username: true, level: true } } } },
    },
  });

  // Update score untuk yang masih ACTIVE
  const enriched = await Promise.all(
    challenges.map(async (c) => {
      if (c.status === PvpChallengeStatus.ACTIVE && c.startsAt && c.endsAt) {
        const [cs, ds] = await Promise.all([
          calculateChallengeScore(c.challengerId, c.mode, c.startsAt, c.endsAt),
          calculateChallengeScore(c.challengedId, c.mode, c.startsAt, c.endsAt),
        ]);
        return { ...c, challengerScore: cs, challengedScore: ds };
      }
      return c;
    })
  );

  const isChallenger = (c: typeof enriched[0]) => c.challengerId === userId;

  return enriched.map((c) => ({
    id: c.id,
    mode: c.mode,
    status: c.status,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    rewardCoins: c.rewardCoins,
    rewardExp: c.rewardExp,
    winnerId: c.winnerId,
    message: c.message,
    createdAt: c.createdAt,
    isChallenger: isChallenger(c),
    myScore: isChallenger(c) ? c.challengerScore : c.challengedScore,
    opponentScore: isChallenger(c) ? c.challengedScore : c.challengerScore,
    opponent: isChallenger(c)
      ? { userId: c.challengedId, username: c.challenged.profile?.username ?? "Unknown", level: c.challenged.profile?.level ?? 1 }
      : { userId: c.challengerId, username: c.challenger.profile?.username ?? "Unknown", level: c.challenger.profile?.level ?? 1 },
    iWon: c.winnerId === userId,
    isDraw: c.status === PvpChallengeStatus.COMPLETED && c.winnerId === null,
  }));
}
