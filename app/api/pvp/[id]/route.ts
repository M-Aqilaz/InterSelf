import { NextRequest, NextResponse } from "next/server";
import { PvpChallengeStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CHALLENGE_DURATION_DAYS } from "@/lib/pvp";
import { parseId } from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Invalid challenge id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const action = body?.action as "accept" | "decline" | undefined;

  if (!action || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Action harus 'accept' atau 'decline'" }, { status: 400 });
  }

  const challenge = await prisma.pvpChallenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge tidak ditemukan" }, { status: 404 });
  if (challenge.challengedId !== user.id) {
    return NextResponse.json({ error: "Bukan challenge untukmu" }, { status: 403 });
  }

  // The status check is part of the update, so accepting twice (or accepting while the
  // challenger cancels) cannot restart the clock or resurrect a cancelled challenge.
  const now = new Date();
  const result = await prisma.pvpChallenge.updateMany({
    where: { id, challengedId: user.id, status: PvpChallengeStatus.PENDING },
    data:
      action === "decline"
        ? { status: PvpChallengeStatus.DECLINED }
        : {
            status: PvpChallengeStatus.ACTIVE,
            startsAt: now,
            endsAt: new Date(now.getTime() + CHALLENGE_DURATION_DAYS * 24 * 60 * 60 * 1000),
          },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Challenge sudah tidak pending" }, { status: 409 });
  }

  if (action === "decline") {
    return NextResponse.json({ success: true, status: "DECLINED" });
  }

  const updated = await prisma.pvpChallenge.findUnique({ where: { id } });
  return NextResponse.json({ success: true, challenge: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Invalid challenge id" }, { status: 400 });

  const challenge = await prisma.pvpChallenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (challenge.challengerId !== user.id) {
    return NextResponse.json({ error: "Hanya penantang yang bisa cancel" }, { status: 403 });
  }

  // Only a challenge nobody has accepted yet can be cancelled.
  const result = await prisma.pvpChallenge.updateMany({
    where: { id, challengerId: user.id, status: PvpChallengeStatus.PENDING },
    data: { status: PvpChallengeStatus.CANCELLED },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Hanya challenge yang masih pending yang bisa dibatalkan" },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
