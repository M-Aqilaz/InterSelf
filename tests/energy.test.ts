import { describe, expect, it } from "vitest";
import { computeEnergy, ENERGY_REGEN_INTERVAL_MS as HOUR } from "@/lib/energy-rules";

const NOW = new Date("2026-03-10T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe("computeEnergy", () => {
  it("regenerates one point per hour and keeps the leftover time", () => {
    const out = computeEnergy({ energy: 1, energyMax: 5, lastEnergyRegenAt: ago(2.5 * HOUR) }, NOW);
    expect(out.energy).toBe(3);
    expect(out.msUntilNextRegen).toBe(0.5 * HOUR);
  });

  it("never exceeds the maximum", () => {
    const out = computeEnergy({ energy: 4, energyMax: 5, lastEnergyRegenAt: ago(30 * HOUR) }, NOW);
    expect(out.energy).toBe(5);
    expect(out.msUntilNextRegen).toBeNull();
  });

  it("pins the timer to now while full, so spending later does not refill instantly", () => {
    const out = computeEnergy({ energy: 5, energyMax: 5, lastEnergyRegenAt: ago(10 * HOUR) }, NOW);
    expect(out.lastEnergyRegenAt.getTime()).toBe(NOW.getTime());
  });

  it("uses energyMax from the profile instead of a hard-coded 5", () => {
    const out = computeEnergy({ energy: 6, energyMax: 8, lastEnergyRegenAt: ago(HOUR) }, NOW);
    expect(out.energy).toBe(7);
  });

  it("ignores a regen timestamp in the future", () => {
    const out = computeEnergy(
      { energy: 2, energyMax: 5, lastEnergyRegenAt: new Date(NOW.getTime() + HOUR) },
      NOW
    );
    expect(out.energy).toBe(2);
  });
});
