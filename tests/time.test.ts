import { describe, expect, it } from "vitest";
import { dayKey, daysBetween, startOfToday } from "@/lib/time";

describe("app timezone (UTC+7)", () => {
  it("starts the day at 00:00 WIB, i.e. 17:00 UTC the day before", () => {
    const start = startOfToday(new Date("2026-03-10T05:00:00Z")); // 12:00 WIB
    expect(start.toISOString()).toBe("2026-03-09T17:00:00.000Z");
  });

  it("rolls over at 17:00 UTC, not at UTC midnight", () => {
    expect(dayKey(new Date("2026-03-10T16:59:00Z"))).toBe("2026-03-10");
    expect(dayKey(new Date("2026-03-10T17:00:00Z"))).toBe("2026-03-11");
  });

  it("counts calendar days, not 24h blocks", () => {
    const lateNight = new Date("2026-03-10T16:30:00Z"); // 23:30 WIB
    const justAfter = new Date("2026-03-10T17:30:00Z"); // 00:30 WIB next day
    expect(daysBetween(lateNight, justAfter)).toBe(1);
    expect(daysBetween(lateNight, new Date("2026-03-10T10:00:00Z"))).toBe(0);
  });
});
