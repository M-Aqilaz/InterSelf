import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncEnergy } from "@/lib/energy";
import { GameError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const energy = await syncEnergy(user.id);
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { gems: true },
    });

    return NextResponse.json({
      energy: energy.energy,
      energyMax: energy.energyMax,
      msUntilNextRegen: energy.msUntilNextRegen,
      gems: profile?.gems ?? 0,
    });
  } catch (error) {
    if (error instanceof GameError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/energy failed", error);
    return NextResponse.json({ error: "Unable to load energy" }, { status: 500 });
  }
}
