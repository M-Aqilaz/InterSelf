import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PvpChallengeStatus } from "@prisma/client";
import { CHALLENGE_DURATION_DAYS } from "@/lib/pvp";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
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
  if (challenge.status !== PvpChallengeStatus.PENDING) {
    return NextResponse.json({ error: "Challenge sudah tidak pending" }, { status: 409 });
  }

  if (action === "decline") {
    await prisma.pvpChallenge.update({
      where: { id },
      data: { status: PvpChallengeStatus.DECLINED },
    });
    return NextResponse.json({ success: true, status: "DECLINED" });
  }

  // Accept → set ACTIVE dengan periode 7 hari dari sekarang
  const now = new Date();
  const endsAt = new Date(now.getTime() + CHALLENGE_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const updated = await prisma.pvpChallenge.update({
    where: { id },
    data: {
      status: PvpChallengeStatus.ACTIVE,
      startsAt: now,
      endsAt,
    },
  });

  return NextResponse.json({ success: true, challenge: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  const challenge = await prisma.pvpChallenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (challenge.challengerId !== user.id) {
    return NextResponse.json({ error: "Hanya penantang yang bisa cancel" }, { status: 403 });
  }
  if (challenge.status === PvpChallengeStatus.ACTIVE) {
    return NextResponse.json({ error: "Tidak bisa cancel challenge yang sudah aktif" }, { status: 409 });
  }

  await prisma.pvpChallenge.update({
    where: { id },
    data: { status: PvpChallengeStatus.CANCELLED },
  });

  return NextResponse.json({ success: true });
}
