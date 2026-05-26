import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const shieldActive = profile.streakShieldActive &&
    (profile.streakShieldExpiry ? profile.streakShieldExpiry > now : false);

  // Cek apakah streak sudah putus (tidak ada task selesai kemarin)
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const completedYesterday = await prisma.taskCompletion.count({
    where: {
      userId: user.id,
      completedAt: { gte: yesterdayStart, lte: yesterdayEnd },
    },
  });

  const streakAtRisk = profile.streak > 0 && completedYesterday === 0;

  return NextResponse.json({
    streak: profile.streak,
    bestStreak: profile.bestStreak,
    shieldActive,
    shieldExpiry: profile.streakShieldExpiry,
    streakAtRisk,
    // Kalau streak putus: debuff info
    debuffActive: streakAtRisk && !shieldActive,
  });
}
