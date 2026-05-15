import { NextRequest, NextResponse } from "next/server";
import { TaskCategory, TaskDifficulty } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyBossDamage } from "@/lib/boss";
import { TaskProgressionError } from "@/lib/progression";

const fallbackTask = {
  category: TaskCategory.FOCUS,
  difficulty: TaskDifficulty.MEDIUM,
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { userId: user.id },
        include: { currentBoss: { include: { rewardItem: true } } },
      });

      if (!profile) {
        throw new TaskProgressionError("Profile not found", 404);
      }

      if (!profile.currentBoss) {
        throw new TaskProgressionError("No active boss", 404);
      }

      const result = await applyBossDamage({
        tx,
        userId: user.id,
        profile,
        expReward: 50,
        statIncreases: {},
        streak: profile.streak,
        level: profile.level,
        taskCategory: profile.currentBoss.weakness ?? fallbackTask.category,
        taskDifficulty: fallbackTask.difficulty,
      });

      if (!result) {
        throw new TaskProgressionError("Unable to apply boss damage", 400);
      }

      return result.summary;
    });

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof TaskProgressionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("POST /api/boss/attack failed", error);
    return NextResponse.json({ error: "Unable to attack boss" }, { status: 500 });
  }
}
