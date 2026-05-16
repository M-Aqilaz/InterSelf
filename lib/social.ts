import {
  ActivityType,
  FriendRequestStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LEADERBOARD_LIMIT = 10;

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  title: string;
  level: number;
  exp: number;
  bestStreak: number;
};

type LeaderboardResponse = {
  top: LeaderboardEntry[];
  userRank: number | null;
};

type FriendSummary = {
  friendshipId: number;
  userId: string;
  username: string;
  level: number;
  title: string;
};

type FriendRequestSummary = {
  id: number;
  fromUserId: string;
  toUserId: string;
  username: string;
  createdAt: string;
  message?: string | null;
};

type FriendsSnapshot = {
  friends: FriendSummary[];
  incoming: FriendRequestSummary[];
  outgoing: FriendRequestSummary[];
};

function profileToLeaderboardEntry(
  profile: Prisma.ProfileGetPayload<{ include: { user: true } }>,
  rank: number
): LeaderboardEntry {
  return {
    rank,
    userId: profile.userId,
    username: profile.username ?? profile.user?.name ?? "Unnamed",
    title: profile.title,
    level: profile.level,
    exp: profile.exp,
    bestStreak: profile.bestStreak,
  };
}

export async function getLeaderboardState(
  userId: string,
  limit: number = LEADERBOARD_LIMIT
): Promise<LeaderboardResponse> {
  const topProfiles = await prisma.profile.findMany({
    orderBy: [
      { level: "desc" },
      { exp: "desc" },
      { bestStreak: "desc" },
    ],
    include: { user: true },
    take: limit,
  });

  const top = topProfiles.map((profile, index) => profileToLeaderboardEntry(profile, index + 1));

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    return { top, userRank: null };
  }

  const higherCount = await prisma.profile.count({
    where: {
      OR: [
        { level: { gt: profile.level } },
        {
          level: profile.level,
          exp: { gt: profile.exp },
        },
        {
          level: profile.level,
          exp: profile.exp,
          bestStreak: { gt: profile.bestStreak },
        },
      ],
    },
  });

  return {
    top,
    userRank: higherCount + 1,
  };
}

async function loadFriendSummaries(userId: string): Promise<FriendSummary[]> {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return friendships
    .map((friendship) => {
      const profile = friendship.friend.profile;
      if (!profile) {
        return null;
      }
      return {
        friendshipId: friendship.id,
        userId: friendship.friendId,
        username: profile.username ?? friendship.friend.name ?? "Friend",
        level: profile.level,
        title: profile.title,
      } satisfies FriendSummary;
    })
    .filter(Boolean) as FriendSummary[];
}

export async function getFriendsSnapshot(userId: string): Promise<FriendsSnapshot> {
  const requestInclude = {
    fromUser: { include: { profile: true } },
    toUser: { include: { profile: true } },
  } as const;

  const [friends, incomingRequests, outgoingRequests] = await Promise.all([
    loadFriendSummaries(userId),
    prisma.friendRequest.findMany({
      where: {
        toUserId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: requestInclude,
      orderBy: { createdAt: "asc" },
    }),
    prisma.friendRequest.findMany({
      where: {
        fromUserId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: requestInclude,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const mapRequest = (
    request: Prisma.FriendRequestGetPayload<{ include: typeof requestInclude }>,
    target: "from" | "to"
  ): FriendRequestSummary => {
    const user = target === "from" ? request.fromUser : request.toUser;
    const profile = user.profile;
    return {
      id: request.id,
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      username: profile?.username ?? user.name ?? "Hunter",
      createdAt: request.createdAt.toISOString(),
      message: request.message,
    };
  };

  return {
    friends,
    incoming: incomingRequests.map((request) => mapRequest(request, "from")),
    outgoing: outgoingRequests.map((request) => mapRequest(request, "to")),
  };
}

export async function sendFriendRequest(
  userId: string,
  targetUsername: string,
  message?: string
) {
  const targetProfile = await prisma.profile.findUnique({ where: { username: targetUsername.toLowerCase() } });

  if (!targetProfile) {
    throw new Error("User not found");
  }

  if (targetProfile.userId === userId) {
    throw new Error("You cannot add yourself");
  }

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      userId,
      friendId: targetProfile.userId,
    },
  });

  if (existingFriendship) {
    throw new Error("You are already friends");
  }

  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      fromUserId: userId,
      toUserId: targetProfile.userId,
      status: FriendRequestStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new Error("Request already sent");
  }

  return prisma.friendRequest.create({
    data: {
      fromUserId: userId,
      toUserId: targetProfile.userId,
      message,
    },
  });
}

async function ensureFriendship(tx: Prisma.TransactionClient, userId: string, friendId: string) {
  await tx.friendship.upsert({
    where: {
      userId_friendId: {
        userId,
        friendId,
      },
    },
    create: {
      userId,
      friendId,
    },
    update: {},
  });
}

export async function respondToFriendRequest(
  userId: string,
  requestId: number,
  action: "accept" | "reject"
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.friendRequest.findUnique({ where: { id: requestId } });

    if (!request || request.toUserId !== userId) {
      throw new Error("Request not found");
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new Error("Request already handled");
    }

    if (action === "reject") {
      await tx.friendRequest.update({
        where: { id: requestId },
        data: {
          status: FriendRequestStatus.REJECTED,
          respondedAt: new Date(),
        },
      });
      return { status: "rejected" };
    }

    await tx.friendRequest.update({
      where: { id: requestId },
      data: {
        status: FriendRequestStatus.ACCEPTED,
        respondedAt: new Date(),
      },
    });

    await Promise.all([
      ensureFriendship(tx, request.fromUserId, request.toUserId),
      ensureFriendship(tx, request.toUserId, request.fromUserId),
    ]);

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.FRIEND_ACTIVITY,
        description: "Accepted a friend request",
        metadata: {
          requestId,
          friendId: request.fromUserId,
        },
      },
    });

    return { status: "accepted" };
  });
}

export async function cancelFriendRequest(userId: string, requestId: number) {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    throw new Error("Request not found");
  }

  if (request.fromUserId !== userId && request.toUserId !== userId) {
    throw new Error("Not authorized");
  }

  if (request.status !== FriendRequestStatus.PENDING) {
    throw new Error("Request already resolved");
  }

  await prisma.friendRequest.delete({ where: { id: requestId } });
  return { status: "cancelled" };
}
