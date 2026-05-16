import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { claimWeeklyChallengeReward } from "@/lib/challenges";

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const challengeId = Number(id);

  if (Number.isNaN(challengeId)) {
    return NextResponse.json({ error: "Invalid challenge id" }, { status: 400 });
  }

  try {
    const result = await claimWeeklyChallengeReward(user.id, challengeId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message ?? "Unable to claim" }, { status: 400 });
  }
}
