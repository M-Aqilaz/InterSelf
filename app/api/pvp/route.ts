import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserChallenges } from "@/lib/pvp";
import { PvpChallengeMode, PvpChallengeStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const challenges = await getUserChallenges(user.id);
    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("PvP GET error:", error);
    return NextResponse.json({ challenges: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const targetUsername = body?.username as string | undefined;
  const mode = (body?.mode as PvpChallengeMode) ?? PvpChallengeMode.TASK_COUNT;
  const message = (body?.message as string | undefined)?.slice(0, 100);

  if (!targetUsername) {
    return NextResponse.json({ error: "Username lawan diperlukan" }, { status: 400 });
  }

  if (!Object.values(PvpChallengeMode).includes(mode)) {
    return NextResponse.json({ error: "Mode tidak valid" }, { status: 400 });
  }

  // Cari target user
  const targetProfile = await prisma.profile.findUnique({
    where: { username: targetUsername.toLowerCase() },
    select: { userId: true, username: true },
  });

  if (!targetProfile) {
    return NextResponse.json({ error: `User "${targetUsername}" tidak ditemukan` }, { status: 404 });
  }

  if (targetProfile.userId === user.id) {
    return NextResponse.json({ error: "Tidak bisa challenge diri sendiri" }, { status: 400 });
  }

  // Cek apakah sudah berteman
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: user.id, friendId: targetProfile.userId },
        { userId: targetProfile.userId, friendId: user.id },
      ],
    },
  });

  if (!friendship) {
    return NextResponse.json({ error: "Hanya bisa challenge teman. Tambahkan mereka sebagai teman dulu." }, { status: 400 });
  }

  // Cek sudah ada challenge aktif/pending dengan orang ini
  const existing = await prisma.pvpChallenge.findFirst({
    where: {
      status: { in: [PvpChallengeStatus.PENDING, PvpChallengeStatus.ACTIVE] },
      OR: [
        { challengerId: user.id, challengedId: targetProfile.userId },
        { challengerId: targetProfile.userId, challengedId: user.id },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Sudah ada challenge aktif atau pending dengan user ini" },
      { status: 409 }
    );
  }

  const challenge = await prisma.pvpChallenge.create({
    data: {
      challengerId: user.id,
      challengedId: targetProfile.userId,
      mode,
      message,
      status: PvpChallengeStatus.PENDING,
      rewardCoins: 150,
      rewardExp: 200,
    },
  });

  return NextResponse.json({ success: true, challenge }, { status: 201 });
}
