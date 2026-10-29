import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveStreak } from "@/lib/streak";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const effective = getEffectiveStreak(profile);

  return NextResponse.json({
    streak: effective.streak,
    bestStreak: profile.bestStreak,
    shieldActive: effective.shieldActive,
    shieldExpiry: profile.streakShieldExpiry,
    streakAtRisk: effective.atRisk,
    // The streak is already lost: the next completed task starts over with a 20% EXP penalty
    // (unless a shield covers the gap).
    debuffActive: effective.broken,
  });
}
