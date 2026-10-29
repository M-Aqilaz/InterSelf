export const ENERGY_REGEN_INTERVAL_MS = 60 * 60 * 1000; // 1 energy per hour
export const DEFAULT_ENERGY_MAX = 5;

export type EnergyState = {
  energy: number;
  energyMax: number;
  lastEnergyRegenAt: Date;
};

export type EnergySnapshot = EnergyState & {
  /** null when energy is full */
  msUntilNextRegen: number | null;
};

/**
 * Energy after applying passive regeneration up to `now`.
 * While energy is full the regen timer is pinned to `now`, so energy spent later
 * starts a fresh one-hour countdown instead of refilling instantly.
 */
export function computeEnergy(state: EnergyState, now: Date = new Date()): EnergySnapshot {
  const max = Math.max(1, state.energyMax);
  const energy = Math.min(max, Math.max(0, state.energy));

  if (energy >= max) {
    return { energy: max, energyMax: max, lastEnergyRegenAt: now, msUntilNextRegen: null };
  }

  const elapsed = Math.max(0, now.getTime() - state.lastEnergyRegenAt.getTime());
  const gained = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);
  const nextEnergy = Math.min(max, energy + gained);

  if (nextEnergy >= max) {
    return { energy: max, energyMax: max, lastEnergyRegenAt: now, msUntilNextRegen: null };
  }

  const lastEnergyRegenAt = new Date(state.lastEnergyRegenAt.getTime() + gained * ENERGY_REGEN_INTERVAL_MS);
  return {
    energy: nextEnergy,
    energyMax: max,
    lastEnergyRegenAt,
    msUntilNextRegen: Math.max(0, ENERGY_REGEN_INTERVAL_MS - (now.getTime() - lastEnergyRegenAt.getTime())),
  };
}
