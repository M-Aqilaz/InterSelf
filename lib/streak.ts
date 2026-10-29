import { daysBetween, startOfToday, DAY_MS } from "@/lib/time";

/** A shield absorbs exactly one missed day and stays usable for this long. */
export const SHIELD_DURATION_MS = 3 * DAY_MS;
export const STREAK_MILESTONE_INTERVAL = 7;
export const STREAK_DEBUFF_MULTIPLIER = 0.8;

export type StreakState = {
  streak: number;
  bestStreak: number;
  lastStreakDate: Date | null;
  streakShieldActive: boolean;
  streakShieldExpiry: Date | null;
  characterClass?: string | null;
};

export type StreakOutcome = {
  streak: number;
  bestStreak: number;
  /** Start of the day this streak was last extended. */
  lastStreakDate: Date;
  /** The streak was lost before this completion (a new run starts, possibly with a penalty). */
  broke: boolean;
  shieldConsumed: boolean;
  /** The streak just reached a multiple of STREAK_MILESTONE_INTERVAL. */
  milestone: boolean;
};

export function isShieldActive(state: StreakState, now: Date = new Date()) {
  return (
    state.streakShieldActive &&
    (state.streakShieldExpiry === null || state.streakShieldExpiry.getTime() > now.getTime())
  );
}

/**
 * Streak after the user completes a task at `now`.
 * The streak counts consecutive days with at least one completed task (not tasks).
 */
export function advanceStreak(state: StreakState, now: Date = new Date()): StreakOutcome {
  const today = startOfToday(now);
  const gap = state.lastStreakDate ? daysBetween(state.lastStreakDate, now) : null;

  let streak: number;
  let broke = false;
  let shieldConsumed = false;

  if (gap === 0) {
    streak = Math.max(state.streak, 1);
  } else if (gap === 1) {
    streak = state.streak + 1;
  } else if (gap === 2 && state.streak > 0 && isShieldActive(state, now)) {
    streak = state.streak + 1;
    shieldConsumed = true;
  } else {
    broke = state.streak > 0;
    const kept = broke && state.characterClass === "PHANTOM" ? Math.floor(state.streak * 0.5) : 0;
    streak = kept + 1;
  }

  return {
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    lastStreakDate: today,
    broke,
    shieldConsumed,
    milestone: gap !== 0 && streak % STREAK_MILESTONE_INTERVAL === 0,
  };
}

export type EffectiveStreak = {
  streak: number;
  /** Stored streak is already lost; the next completion starts over. */
  broken: boolean;
  /** Streak is still alive but nothing was done today, so it ends if today is missed. */
  atRisk: boolean;
  shieldActive: boolean;
};

/** What the user should see right now, without waiting for the next completion to normalise it. */
export function getEffectiveStreak(state: StreakState, now: Date = new Date()): EffectiveStreak {
  const shieldActive = isShieldActive(state, now);

  if (state.streak <= 0 || !state.lastStreakDate) {
    return { streak: 0, broken: false, atRisk: false, shieldActive };
  }

  const gap = daysBetween(state.lastStreakDate, now);

  if (gap <= 0) return { streak: state.streak, broken: false, atRisk: false, shieldActive };
  if (gap === 1) return { streak: state.streak, broken: false, atRisk: true, shieldActive };
  if (gap === 2 && shieldActive) {
    return { streak: state.streak, broken: false, atRisk: true, shieldActive };
  }
  return { streak: 0, broken: true, atRisk: false, shieldActive };
}
