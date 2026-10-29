// All "day" boundaries (daily tasks, streaks, daily chest) use one app-wide timezone,
// so they never disagree with each other. Default is WIB (UTC+7, no DST).
export const DAY_MS = 24 * 60 * 60 * 1000;

function resolveOffsetHours() {
  const raw = Number(process.env.APP_UTC_OFFSET_HOURS ?? 7);
  return Number.isFinite(raw) ? raw : 7;
}

const OFFSET_MS = resolveOffsetHours() * 60 * 60 * 1000;

/** Midnight (app timezone) of the day containing `date`, as an absolute Date. */
export function startOfToday(date: Date = new Date()) {
  const local = date.getTime() + OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS - OFFSET_MS);
}

/** YYYY-MM-DD of `date` in the app timezone. */
export function dayKey(date: Date = new Date()) {
  return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** Whole calendar days from `from` to `to` in the app timezone (0 = same day, 1 = next day). */
export function daysBetween(from: Date, to: Date) {
  return Math.round((startOfToday(to).getTime() - startOfToday(from).getTime()) / DAY_MS);
}
