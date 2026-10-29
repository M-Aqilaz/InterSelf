import {
  ActivityType,
  ChallengeStatus,
  Prisma,
  UserChallengeProgress,
  WeeklyChallenge,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GameError } from "@/lib/errors";
import { GEMS_REWARDS } from "@/lib/gems";
import { grantRewards } from "@/lib/rewards";
import { ensureInventoryCapacity } from "@/lib/inventory";

const now = () => new Date();

type RequiredTask = {
  title: string;
  count?: number;
};

type ChallengeSummary = {
  id: number;
  title: string;
  description: string;
  status: ChallengeStatus;
  progress: number;
  target: number;
  startDate: string;
  endDate: string;
  rewardExp: number;
  rewardCoins: number;
  rewardItemName?: string | null;
  claimable: boolean;
  claimedAt: string | null;
};

type ProgressRecord = (UserChallengeProgress & { claimedAt: Date | null }) | undefined;

type ProgressWithChallenge =
  Prisma.UserChallengeProgressGetPayload<{
    include: { challenge: { include: { rewardItem: true } } };
  }> & {
    claimedAt: Date | null;
  };

function parseRequiredTasks(challenge: WeeklyChallenge): RequiredTask[] {
  const raw = challenge.requiredTasks as RequiredTask[] | null;
  if (!raw || !Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((task) => ({
      title: task.title?.toLowerCase().trim(),
      count: task.count ?? 1,
    }))
    .filter((task) => Boolean(task.title)) as RequiredTask[];
}

function matchesTask(required: RequiredTask[], taskTitle: string) {
  if (!required.length) {
    return true;
  }
  const normalized = taskTitle.toLowerCase().trim();
  return required.some((task) => task.title === normalized);
}

export async function recordWeeklyChallengeProgress(
  tx: Prisma.TransactionClient,
  userId: string,
  taskTitle: string
) {
  const today = now();
  const challenges = await tx.weeklyChallenge.findMany({
    where: {
      status: ChallengeStatus.ACTIVE,
      startDate: { lte: today },
      endDate: { gte: today },
    },
  });

  if (!challenges.length) {
    return;
  }

  for (const challenge of challenges) {
    const tasks = parseRequiredTasks(challenge);
    if (!matchesTask(tasks, taskTitle)) {
      continue;
    }

    const progressRecord = await tx.userChallengeProgress.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
      create: {
        userId,
        challengeId: challenge.id,
        progress: 0,
        status: ChallengeStatus.ACTIVE,
      },
      update: {
        status: ChallengeStatus.ACTIVE,
      },
    });

    if (progressRecord.status === ChallengeStatus.COMPLETED) {
      continue;
    }

    const nextProgress = Math.min(challenge.progressTarget, progressRecord.progress + 1);
    const completed = nextProgress >= challenge.progressTarget;

    await tx.userChallengeProgress.update({
      where: { id: progressRecord.id },
      data: {
        progress: nextProgress,
        status: completed ? ChallengeStatus.COMPLETED : ChallengeStatus.ACTIVE,
        completedAt: completed ? now() : progressRecord.completedAt,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.CHALLENGE_PROGRESS,
        description: `Progressed ${challenge.title}`,
        metadata: {
          challengeId: challenge.id,
          progress: nextProgress,
          target: challenge.progressTarget,
        },
      },
    });
  }
}

export async function getWeeklyChallengesForUser(userId: string): Promise<ChallengeSummary[]> {
  const today = now();
  const challenges = await prisma.weeklyChallenge.findMany({
    where: {
      endDate: { gte: today },
    },
    orderBy: { startDate: "asc" },
    take: 5,
    include: {
      userProgress: {
        where: { userId },
      },
      rewardItem: true,
    },
  });

  return challenges.map((challenge) => {
    const progress = challenge.userProgress[0] as ProgressRecord;
    const claimable = Boolean(
      progress &&
        progress.status === ChallengeStatus.COMPLETED &&
        !progress.claimedAt
    );

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      status: progress?.status ?? challenge.status,
      progress: progress?.progress ?? 0,
      target: challenge.progressTarget,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      rewardExp: challenge.rewardExp,
      rewardCoins: challenge.rewardCoins,
      rewardItemName: challenge.rewardItem?.name ?? null,
      claimable,
      claimedAt: progress?.claimedAt ? progress.claimedAt.toISOString() : null,
    } satisfies ChallengeSummary;
  });
}

export async function claimWeeklyChallengeReward(
  userId: string,
  challengeId: number
) {
  return prisma.$transaction(async (tx) => {
    const progress = (await tx.userChallengeProgress.findFirst({
      where: { userId, challengeId },
      include: {
        challenge: {
          include: { rewardItem: true },
        },
      },
    })) as ProgressWithChallenge | null;

    if (!progress) {
      throw new GameError("Challenge progress not found", 404);
    }

    if (progress.status !== ChallengeStatus.COMPLETED || !progress.completedAt) {
      throw new GameError("Challenge not completed");
    }

    // The unclaimed check is part of the update, so two simultaneous requests cannot both pay out.
    const claimed = await tx.userChallengeProgress.updateMany({
      where: { id: progress.id, claimedAt: null },
      data: { claimedAt: now() },
    });
    if (claimed.count === 0) {
      throw new GameError("Reward already claimed", 409);
    }

    const challenge = progress.challenge;

    const { levelProgress } = await grantRewards(tx, userId, {
      exp: challenge.rewardExp,
      coins: challenge.rewardCoins,
      gems: GEMS_REWARDS.WEEKLY_CHALLENGE,
    });

    if (challenge.rewardItemId) {
      await ensureInventoryCapacity(tx, userId, challenge.rewardItemId, 1);
    }

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.CHALLENGE_PROGRESS,
        description: `Claimed ${challenge.title} reward`,
        metadata: {
          challengeId,
          rewardExp: challenge.rewardExp,
          rewardCoins: challenge.rewardCoins,
          rewardGems: GEMS_REWARDS.WEEKLY_CHALLENGE,
        },
      },
    });

    return {
      reward: {
        exp: challenge.rewardExp,
        coins: challenge.rewardCoins,
        gems: GEMS_REWARDS.WEEKLY_CHALLENGE,
        item: challenge.rewardItem?.name ?? null,
      },
      levelProgress,
    };
  });
}
