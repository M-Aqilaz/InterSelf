import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWeeklyChallengesForUser } from "@/lib/challenges";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getWeeklyChallengesForUser(user.id);
  return NextResponse.json({ challenges: data });
}
