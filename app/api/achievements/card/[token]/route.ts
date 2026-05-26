import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const userAchievement = await prisma.userAchievement.findUnique({
    where: { shareToken: token },
    include: {
      achievement: true,
      user: {
        select: {
          profile: {
            select: {
              username: true,
              level: true,
              rank: true,
              title: true,
              characterClass: true,
            },
          },
        },
      },
    },
  });

  if (!userAchievement) {
    return NextResponse.json({ error: "Achievement tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    achievement: {
      name: userAchievement.achievement.name,
      description: userAchievement.achievement.description,
      icon: userAchievement.achievement.icon,
      rarity: userAchievement.achievement.rarity,
      rewardExp: userAchievement.achievement.rewardExp,
      rewardCoins: userAchievement.achievement.rewardCoins,
      unlockCondition: userAchievement.achievement.unlockCondition,
      unlockedAt: userAchievement.unlockedAt,
    },
    user: {
      username: userAchievement.user.profile?.username ?? "Adventurer",
      level: userAchievement.user.profile?.level ?? 1,
      rank: userAchievement.user.profile?.rank ?? "BRONZE",
      title: userAchievement.user.profile?.title ?? "Awakened",
      characterClass: (userAchievement.user.profile as { characterClass?: string | null })?.characterClass ?? null,
    },
  });
}
