import { NextRequest, NextResponse } from "next/server";
import { ActivityType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAY_MS, startOfToday } from "@/lib/time";
import { SHIELD_DURATION_MS } from "@/lib/streak";
import { grantRewards } from "@/lib/rewards";
import { errorResponse } from "@/lib/api";

// Reward pool berdasarkan hari streak chest
const CHEST_REWARDS = [
  { day: 1, exp: 100, coins: 50, label: "Harian", rarity: "common" },
  { day: 2, exp: 120, coins: 60, label: "Hari ke-2", rarity: "common" },
  { day: 3, exp: 150, coins: 80, label: "Hari ke-3", rarity: "uncommon" },
  { day: 4, exp: 180, coins: 100, label: "Hari ke-4", rarity: "uncommon" },
  { day: 5, exp: 220, coins: 130, label: "Hari ke-5", rarity: "rare" },
  { day: 6, exp: 260, coins: 160, label: "Hari ke-6", rarity: "rare" },
  { day: 7, exp: 400, coins: 300, label: "MINGGUAN", rarity: "epic", bonus: "Streak Shield aktif 3 hari" },
];

/** Where the chest streak stands for a given last-claim time (app timezone days). */
function chestState(lastClaim: Date | null, storedStreak: number, now: Date) {
  const today = startOfToday(now);
  const yesterday = new Date(today.getTime() - DAY_MS);
  const alreadyClaimed = lastClaim !== null && lastClaim >= today;
  const streakBroken = lastClaim === null || lastClaim < yesterday;
  const previousStreak = streakBroken ? 0 : storedStreak;
  const rewardDay = (previousStreak % 7) + 1;
  return { today, alreadyClaimed, previousStreak, rewardDay, reward: CHEST_REWARDS[rewardDay - 1] };
}

// GET — cek apakah chest sudah diklaim hari ini
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const state = chestState(profile.lastDailyChestAt, profile.dailyChestStreak, new Date());

  return NextResponse.json({
    alreadyClaimed: state.alreadyClaimed,
    currentStreak: state.previousStreak,
    nextReward: state.reward,
    lastClaimedAt: profile.lastDailyChestAt,
  });
}

// POST — klaim chest
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({ where: { userId: user.id } });
      if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

      const now = new Date();
      const state = chestState(profile.lastDailyChestAt, profile.dailyChestStreak, now);

      // The "not claimed today" check is part of the update: only one simultaneous request wins.
      const claim = await tx.profile.updateMany({
        where: {
          userId: user.id,
          OR: [{ lastDailyChestAt: null }, { lastDailyChestAt: { lt: state.today } }],
        },
        data: { lastDailyChestAt: now },
      });
      if (claim.count === 0) {
        return NextResponse.json({ error: "Sudah diklaim hari ini" }, { status: 409 });
      }

      const reward = state.reward;
      const newStreak = state.previousStreak + 1;
      const isDay7 = state.rewardDay === 7;

      const { profile: updatedProfile, levelProgress } = await grantRewards(tx, user.id, {
        exp: reward.exp,
        coins: reward.coins,
        data: {
          dailyChestStreak: newStreak,
          ...(isDay7 && {
            streakShieldActive: true,
            streakShieldExpiry: new Date(now.getTime() + SHIELD_DURATION_MS),
          }),
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: ActivityType.ITEM_EARNED,
          description: `Daily chest day ${state.rewardDay} diklaim`,
          metadata: { exp: reward.exp, coins: reward.coins, day: state.rewardDay, rarity: reward.rarity },
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
  } catch (error) {
    return errorResponse(error, "POST /api/daily-chest failed", "Unable to claim chest");
  }
}
