import { NextRequest, NextResponse } from "next/server";
import { TaskCategory, TaskDifficulty } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyBossDamage } from "@/lib/boss";
import { consumeEnergy } from "@/lib/energy";
import { GameError } from "@/lib/errors";
import { errorResponse } from "@/lib/api";

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
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { userId: user.id },
        include: { currentBoss: { include: { rewardItem: true } } },
      });

      if (!profile) {
        throw new GameError("Profile not found", 404);
      }

      if (!profile.currentBoss) {
        throw new GameError("No active boss", 404);
      }

      // Energy is spent here, on the server, in the same transaction as the hit.
      // If the strike is rejected (cooldown) the whole transaction rolls back and no energy is lost.
      const energy = await consumeEnergy(user.id, 1, tx);

      const hit = await applyBossDamage({
        tx,
        userId: user.id,
        profile,
        expReward: 50,
        statIncreases: {},
        streak: profile.streak,
        level: profile.level,
        taskCategory: profile.currentBoss.weakness ?? fallbackTask.category,
        taskDifficulty: fallbackTask.difficulty,
        source: "Manual energy strike",
      });

      if (!hit) {
        throw new GameError("Unable to apply boss damage", 400);
      }

      if (hit.summary.cooldownRemainingMs > 0) {
        throw new GameError(
          `Boss is recovering. Try again in ${Math.ceil(hit.summary.cooldownRemainingMs / 1000)}s.`,
          429
        );
      }

      return { summary: hit.summary, energy };
    });

    return NextResponse.json({
      ...result.summary,
      energy: result.energy.energy,
      energyMax: result.energy.energyMax,
    });
  } catch (error) {
    return errorResponse(error, "POST /api/boss/attack failed", "Unable to attack boss");
  }
}
