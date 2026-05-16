import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { claimAchievementReward } from "@/lib/achievements";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const achievementId = Number(id);

  if (Number.isNaN(achievementId)) {
    return NextResponse.json({ error: "Invalid achievement id" }, { status: 400 });
  }

  try {
    const result = await claimAchievementReward(user.id, achievementId);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`POST /api/achievements/${achievementId}/claim failed`, error);
    return NextResponse.json({ error: (error as Error).message ?? "Unable to claim" }, { status: 400 });
  }
}
