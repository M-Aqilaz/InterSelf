import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listAchievementsForUser } from "@/lib/achievements";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const achievements = await listAchievementsForUser(user.id);
  return NextResponse.json({ achievements });
}
