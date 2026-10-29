import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GameError } from "@/lib/errors";
import { computeEnergy, ENERGY_REGEN_INTERVAL_MS, type EnergySnapshot } from "@/lib/energy-rules";

type Client = Prisma.TransactionClient | PrismaClient;

const MAX_ATTEMPTS = 5;

/**
 * Read-modify-write on the energy columns guarded by their previous values
 * (optimistic concurrency): if another request changed them in between, retry.
 */
async function mutateEnergy(
  client: Client,
  userId: string,
  amount: number
): Promise<EnergySnapshot> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const profile = await client.profile.findUnique({
      where: { userId },
      select: { energy: true, energyMax: true, lastEnergyRegenAt: true },
    });
    if (!profile) throw new GameError("Profile not found", 404);

    const now = new Date();
    const current = computeEnergy(profile, now);

    if (current.energy < amount) {
      throw new GameError("Not enough energy. Wait for regen.", 400);
    }

    // Already full and nothing to spend: nothing to persist.
    if (amount === 0 && profile.energy >= current.energyMax) return current;

    const wasFull = current.energy >= current.energyMax;
    const nextEnergy = current.energy - amount;
    const next: EnergySnapshot =
      amount > 0
        ? {
            ...computeEnergy({ ...current, energy: nextEnergy }, now),
            // spending from a full bar starts a fresh countdown
            lastEnergyRegenAt: wasFull ? now : current.lastEnergyRegenAt,
          }
        : current;

    const unchanged =
      next.energy === profile.energy &&
      next.lastEnergyRegenAt.getTime() === profile.lastEnergyRegenAt.getTime();
    if (unchanged) return computeEnergy(profile, now);

    const result = await client.profile.updateMany({
      where: {
        userId,
        energy: profile.energy,
        lastEnergyRegenAt: profile.lastEnergyRegenAt,
      },
      data: { energy: next.energy, lastEnergyRegenAt: next.lastEnergyRegenAt },
    });

    if (result.count === 1) {
      return {
        ...next,
        msUntilNextRegen:
          next.energy >= next.energyMax
            ? null
            : Math.max(0, ENERGY_REGEN_INTERVAL_MS - (now.getTime() - next.lastEnergyRegenAt.getTime())),
      };
    }
  }

  throw new GameError("Energy is busy, please try again.", 409);
}

/** Persist passive regeneration and return the current energy. */
export function syncEnergy(userId: string, client: Client = prisma) {
  return mutateEnergy(client, userId, 0);
}

/** Atomically spend energy; throws GameError(400) when there is not enough. */
export function consumeEnergy(userId: string, amount = 1, client: Client = prisma) {
  return mutateEnergy(client, userId, amount);
}
