import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { selectBossForUser } from "@/lib/boss";
import { prisma } from "@/lib/prisma";
import { BossProgressStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bossId = Number(body?.bossId);

  if (!bossId || isNaN(bossId)) {
    return NextResponse.json({ error: "bossId diperlukan" }, { status: 400 });
  }

  // Cek apakah boss ada dan user punya level cukup
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { level: true },
  });

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const boss = await prisma.boss.findUnique({ where: { id: bossId } });
  if (!boss) return NextResponse.json({ error: "Dungeon tidak ditemukan" }, { status: 404 });

  if (profile.level < boss.minLevel) {
    return NextResponse.json(
      { error: `Butuh Level ${boss.minLevel} untuk masuk ${boss.dungeonName}. Level kamu: ${profile.level}` },
      { status: 403 }
    );
  }

  // Cek apakah sudah conquered
  const existingProgress = await prisma.userBossProgress.findUnique({
    where: { userId_bossId: { userId: user.id, bossId } },
  });

  if (existingProgress?.status === BossProgressStatus.VICTORIOUS) {
    return NextResponse.json(
      { error: "Dungeon ini sudah kamu taklukkan!" },
      { status: 409 }
    );
  }

  // Set boss ini sebagai current boss
  const state = await selectBossForUser(user.id, bossId);
  return NextResponse.json({ success: true, state });
}
