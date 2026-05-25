import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ENERGY_REGEN_INTERVAL_MS = 60 * 60 * 1000;
const MAX_ENERGY = 5;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Calculate regen first
  const now = new Date();
  const lastRegen = profile.lastEnergyRegenAt ?? now;
  const msSinceRegen = now.getTime() - lastRegen.getTime();
  const energyToAdd = Math.floor(msSinceRegen / ENERGY_REGEN_INTERVAL_MS);
  const currentEnergy = Math.min(MAX_ENERGY, profile.energy + energyToAdd);

  if (currentEnergy <= 0) {
    return NextResponse.json({ error: "No energy! Wait for regen.", energy: 0 }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { userId: user.id },
    data: {
      energy: Math.max(0, currentEnergy - 1),
      lastEnergyRegenAt: energyToAdd > 0
        ? new Date(lastRegen.getTime() + energyToAdd * ENERGY_REGEN_INTERVAL_MS)
        : lastRegen,
    },
  });

  return NextResponse.json({ energy: updated.energy, energyMax: MAX_ENERGY });
}
