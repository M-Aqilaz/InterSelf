import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const achievementId = Number(idParam);
  if (isNaN(achievementId)) {
    return NextResponse.json({ error: "Invalid achievement id" }, { status: 400 });
  }

  // Hanya achievement yang sudah CLAIMED yang bisa di-share
  const userAchievement = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId: user.id, achievementId } },
    include: { achievement: true },
  });

  if (!userAchievement) {
    return NextResponse.json({ error: "Achievement belum kamu unlock" }, { status: 404 });
  }

  if (!userAchievement.claimedAt) {
    return NextResponse.json(
      { error: "Claim reward achievement dulu sebelum share" },
      { status: 400 }
    );
  }

  // Pakai token yang sudah ada atau generate baru
  let shareToken = userAchievement.shareToken;
  if (!shareToken) {
    shareToken = randomBytes(16).toString("hex");
    await prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: { shareToken },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/share/achievement/${shareToken}`;

  return NextResponse.json({
    shareToken,
    shareUrl,
    achievement: {
      name: userAchievement.achievement.name,
      rarity: userAchievement.achievement.rarity,
    },
  });
}
