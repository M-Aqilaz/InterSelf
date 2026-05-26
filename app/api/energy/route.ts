import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ENERGY_REGEN_INTERVAL_MS = 60 * 60 * 1000;
const MAX_ENERGY = 5;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const now = new Date();
  const lastRegen = profile.lastEnergyRegenAt ?? now;
  const msSinceRegen = Math.max(0, now.getTime() - lastRegen.getTime());
  const energyToAdd = Math.floor(msSinceRegen / ENERGY_REGEN_INTERVAL_MS);
  
  // Clamp: never go below 0, never above MAX
  const currentEnergy = Math.min(MAX_ENERGY, Math.max(0, profile.energy + energyToAdd));

  if (energyToAdd > 0 && profile.energy < MAX_ENERGY) {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        energy: currentEnergy,
        lastEnergyRegenAt: new Date(lastRegen.getTime() + energyToAdd * ENERGY_REGEN_INTERVAL_MS),
      },
    });
  }

  const msUntilNext = currentEnergy >= MAX_ENERGY
    ? null
    : Math.max(0, ENERGY_REGEN_INTERVAL_MS - (msSinceRegen % ENERGY_REGEN_INTERVAL_MS));

  return NextResponse.json({
    energy: currentEnergy,
    energyMax: MAX_ENERGY,
    msUntilNextRegen: msUntilNext,
    gems: profile.gems,
  });
}
