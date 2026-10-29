import { describe, expect, it } from "vitest";
import { advanceStreak, getEffectiveStreak, type StreakState } from "@/lib/streak";

const DAY = 24 * 60 * 60 * 1000;
// 12:00 WIB on 2026-03-10
const NOW = new Date("2026-03-10T05:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY);

function state(overrides: Partial<StreakState> = {}): StreakState {
  return {
    streak: 0,
    bestStreak: 0,
    lastStreakDate: null,
    streakShieldActive: false,
    streakShieldExpiry: null,
    characterClass: null,
    ...overrides,
  };
}

describe("advanceStreak", () => {
  it("starts a streak at 1 for a new player", () => {
    const out = advanceStreak(state(), NOW);
    expect(out.streak).toBe(1);
    expect(out.broke).toBe(false);
  });

  it("does not count several tasks on the same day more than once", () => {
    const out = advanceStreak(state({ streak: 3, bestStreak: 3, lastStreakDate: daysAgo(0) }), NOW);
    expect(out.streak).toBe(3);
    expect(out.milestone).toBe(false);
  });

  it("extends the streak when yesterday was active", () => {
    const out = advanceStreak(state({ streak: 3, bestStreak: 3, lastStreakDate: daysAgo(1) }), NOW);
    expect(out.streak).toBe(4);
    expect(out.bestStreak).toBe(4);
  });

  it("flags a milestone every 7 days", () => {
    const out = advanceStreak(state({ streak: 6, bestStreak: 6, lastStreakDate: daysAgo(1) }), NOW);
    expect(out.streak).toBe(7);
    expect(out.milestone).toBe(true);
  });

  it("resets to 1 after a missed day and keeps the best streak", () => {
    const out = advanceStreak(state({ streak: 9, bestStreak: 9, lastStreakDate: daysAgo(2) }), NOW);
    expect(out.streak).toBe(1);
    expect(out.bestStreak).toBe(9);
    expect(out.broke).toBe(true);
  });

  it("lets a shield absorb exactly one missed day", () => {
    const shield = { streakShieldActive: true, streakShieldExpiry: new Date(NOW.getTime() + DAY) };
    const saved = advanceStreak(state({ streak: 5, bestStreak: 5, lastStreakDate: daysAgo(2), ...shield }), NOW);
    expect(saved.streak).toBe(6);
    expect(saved.shieldConsumed).toBe(true);

    const tooLate = advanceStreak(state({ streak: 5, bestStreak: 5, lastStreakDate: daysAgo(3), ...shield }), NOW);
    expect(tooLate.streak).toBe(1);
    expect(tooLate.shieldConsumed).toBe(false);
  });

  it("ignores an expired shield", () => {
    const out = advanceStreak(
      state({
        streak: 5,
        bestStreak: 5,
        lastStreakDate: daysAgo(2),
        streakShieldActive: true,
        streakShieldExpiry: new Date(NOW.getTime() - 1000),
      }),
      NOW
    );
    expect(out.streak).toBe(1);
  });

  it("PHANTOM keeps half of a broken streak", () => {
    const out = advanceStreak(
      state({ streak: 10, bestStreak: 10, lastStreakDate: daysAgo(4), characterClass: "PHANTOM" }),
      NOW
    );
    expect(out.streak).toBe(6); // 5 kept + today
  });
});

describe("getEffectiveStreak", () => {
  it("shows a live streak that is at risk until a task is done today", () => {
    expect(getEffectiveStreak(state({ streak: 4, lastStreakDate: daysAgo(1) }), NOW)).toMatchObject({
      streak: 4,
      atRisk: true,
      broken: false,
    });
    expect(getEffectiveStreak(state({ streak: 4, lastStreakDate: daysAgo(0) }), NOW)).toMatchObject({
      streak: 4,
      atRisk: false,
    });
  });

  it("shows 0 once the streak has lapsed", () => {
    expect(getEffectiveStreak(state({ streak: 4, lastStreakDate: daysAgo(3) }), NOW)).toMatchObject({
      streak: 0,
      broken: true,
    });
  });
});
