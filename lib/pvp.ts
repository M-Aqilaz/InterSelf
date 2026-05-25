import { prisma } from "@/lib/prisma";
import { PvpChallengeMode, PvpChallengeStatus } from "@prisma/client";

export const CHALLENGE_DURATION_DAYS = 7;
export const CHALLENGE_REWARD_COINS = 150;
export const CHALLENGE_REWARD_EXP = 200;

// Hitung score user untuk periode challenge tertentu
export async function calculateChallengeScore(
  userId: string,
  mode: PvpChallengeMode,
  startsAt: Date,
  endsAt: Date
): Promise<number> {
  const completions = await prisma.taskCompletion.findMany({
    where: {
      userId,
      completedAt: { gte: startsAt, lte: endsAt },
    },
    select: {
      expEarned: true,
      streakCount: true,
    },
  });

  switch (mode) {
    case PvpChallengeMode.TASK_COUNT:
      return completions.length;
    case PvpChallengeMode.EXP_RACE:
      return completions.reduce((sum, c) => sum + c.expEarned, 0);
    case PvpChallengeMode.STREAK_HOLD:
      return Math.max(...completions.map((c) => c.streakCount), 0);
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
      await tx.pvpChallenge.update({
        where: { id: challenge.id },
        data: {
          status: PvpChallengeStatus.COMPLETED,
          challengerScore,
          challengedScore,
          winnerId,
        },
      });

      // Kasih reward ke pemenang
      if (winnerId) {
        await tx.profile.update({
          where: { userId: winnerId },
          data: {
            coins: { increment: challenge.rewardCoins },
            exp: { increment: challenge.rewardExp },
          },
        });

        await tx.activityLog.create({
          data: {
            userId: winnerId,
            type: "ITEM_EARNED",
            description: `Menang PvP Challenge! +${challenge.rewardCoins} coins +${challenge.rewardExp} EXP`,
            metadata: { challengeId: challenge.id, mode: challenge.mode },
          },
        });
      }
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
