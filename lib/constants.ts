export const BASE_STAT_TYPES = [
  "DISCIPLINE",
  "INTELLIGENCE",
  "FOCUS",
  "FITNESS",
  "FINANCE",
  "CONSISTENCY",
] as const;

export type StatTypeValue = (typeof BASE_STAT_TYPES)[number];

export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const SESSION_COOKIE_NAME = "interself.session";
