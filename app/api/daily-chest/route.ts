import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";

// Reward pool berdasarkan hari streak chest
const CHEST_REWARDS = [
  { day: 1, exp: 100, coins: 50,  label: "Harian",   rarity: "common"    },
  { day: 2, exp: 120, coins: 60,  label: "Hari ke-2", rarity: "common"   },
  { day: 3, exp: 150, coins: 80,  label: "Hari ke-3", rarity: "uncommon" },
  { day: 4, exp: 180, coins: 100, label: "Hari ke-4", rarity: "uncommon" },
  { day: 5, exp: 220, coins: 130, label: "Hari ke-5", rarity: "rare"     },
  { day: 6, exp: 260, coins: 160, label: "Hari ke-6", rarity: "rare"     },
  { day: 7, exp: 400, coins: 300, label: "MINGGUAN",  rarity: "epic",
    bonus: "Streak Shield aktif 24 jam" },
];

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// GET — cek apakah chest sudah diklaim hari ini
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const todayUTC = startOfTodayUTC();
  const lastClaim = profile.lastDailyChestAt;
  const alreadyClaimed = lastClaim ? lastClaim >= todayUTC : false;

  // Hitung streak chest
  const yesterdayUTC = new Date(todayUTC.getTime() - 86400000);
  const streakBroken = lastClaim ? lastClaim < yesterdayUTC : true;
  const currentStreak = streakBroken ? 0 : (profile.dailyChestStreak ?? 0);
  const nextDay = Math.min((currentStreak % 7) + 1, 7);
  const reward = CHEST_REWARDS[nextDay - 1] ?? CHEST_REWARDS[0];

  return NextResponse.json({
    alreadyClaimed,
    currentStreak,
    nextReward: reward,
    lastClaimedAt: lastClaim,
  });
}

// POST — klaim chest
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new Error("Profile not found");

    const todayUTC = startOfTodayUTC();
    const lastClaim = profile.lastDailyChestAt;

    if (lastClaim && lastClaim >= todayUTC) {
      return NextResponse.json({ error: "Sudah diklaim hari ini" }, { status: 409 });
    }

    // Hitung streak
    const yesterdayUTC = new Date(todayUTC.getTime() - 86400000);
    const streakBroken = lastClaim ? lastClaim < yesterdayUTC : true;
    const prevStreak = streakBroken ? 0 : (profile.dailyChestStreak ?? 0);
    const newStreak = prevStreak + 1;
    const rewardDay = Math.min((prevStreak % 7) + 1, 7);
    const reward = CHEST_REWARDS[rewardDay - 1] ?? CHEST_REWARDS[0];

    // Apply reward
    const newExp = profile.exp + reward.exp;
    const levelProgress = calculateLevelFromTotalExp(newExp);

    // Activate Streak Shield on day 7
    const isDay7 = rewardDay === 7;
    const shieldExpiry = isDay7 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;

    const updatedProfile = await tx.profile.update({
      where: { userId: user.id },
      data: {
        exp: newExp,
        level: levelProgress.level,
        coins: { increment: reward.coins },
        lastDailyChestAt: new Date(),
        dailyChestStreak: newStreak,
        ...(isDay7 && {
          streakShieldActive: true,
          streakShieldExpiry: shieldExpiry,
        }),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: user.id,
        type: "ITEM_EARNED",
        description: `Daily chest day ${rewardDay} diklaim`,
        metadata: { exp: reward.exp, coins: reward.coins, day: rewardDay, rarity: reward.rarity },
      },
    });

    return NextResponse.json({
      success: true,
      reward,
      newStreak,
      profile: {
        exp: updatedProfile.exp,
        coins: updatedProfile.coins,
        level: updatedProfile.level,
      },
      levelProgress,
    });
  });
}
