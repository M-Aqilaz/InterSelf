import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BossProgressStatus } from "@prisma/client";

export type DungeonZone = {
  bossId: number;
  dungeonName: string;
  dungeonTier: string;
  dungeonBiome: string;
  loreText: string;
  bossName: string;
  bossDescription: string;
  maxHp: number;
  weakness: string | null;
  rewardExp: number;
  rewardCoins: number;
  rewardItemName: string | null;
  minLevel: number;
  // Status dari perspektif user:
  isUnlocked: boolean;       // level user >= minLevel
  isCurrentBoss: boolean;    // ini boss yang sedang user lawan
  isConquered: boolean;      // user sudah kalahkan boss ini
  userCurrentHp: number | null; // HP boss dari perspektif user
  percentageRemaining: number | null;
};

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ambil profile user
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { level: true, currentBossId: true },
  });

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Ambil semua boss (dungeon zones)
  const allBosses = await prisma.boss.findMany({
    orderBy: { minLevel: "asc" },
    include: { rewardItem: true },
  });

  // Ambil progress user untuk semua boss
  const userProgressList = await prisma.userBossProgress.findMany({
    where: { userId: user.id },
  });

  const progressMap = new Map(
    userProgressList.map((p) => [p.bossId, p])
  );

  const dungeons: DungeonZone[] = allBosses.map((boss) => {
    const progress = progressMap.get(boss.id);
    const isUnlocked = profile.level >= boss.minLevel;
    const isCurrentBoss = profile.currentBossId === boss.id;
    const isConquered = progress?.status === BossProgressStatus.VICTORIOUS;
    const currentHp = progress?.currentHp ?? null;
    const percentageRemaining = currentHp !== null
      ? Math.round((currentHp / boss.maxHp) * 100)
      : null;

    return {
      bossId: boss.id,
      dungeonName: boss.dungeonName || boss.name,
      dungeonTier: boss.dungeonTier || "F",
      dungeonBiome: boss.dungeonBiome || "",
      loreText: boss.loreText || "",
      bossName: boss.name,
      bossDescription: boss.description,
      maxHp: boss.maxHp,
      weakness: boss.weakness,
      rewardExp: boss.rewardExp,
      rewardCoins: boss.rewardCoins,
      rewardItemName: boss.rewardItem?.name ?? null,
      minLevel: boss.minLevel,
      isUnlocked,
      isCurrentBoss,
      isConquered,
      userCurrentHp: isConquered ? 0 : currentHp,
      percentageRemaining: isConquered ? 0 : percentageRemaining,
    };
  });

  return NextResponse.json({
    dungeons,
    userLevel: profile.level,
    currentBossId: profile.currentBossId,
  });
}
