import { describe, expect, it } from "vitest";
import { parseId } from "@/lib/api";
import { calculateLevelFromTotalExp } from "@/lib/level";

describe("parseId", () => {
  it("accepts plain positive integers", () => {
    expect(parseId("42")).toBe(42);
  });

  it.each(["", "0", "-3", "1.5", "1e3", "Infinity", "NaN", "12abc", "99999999999999999999"])(
    "rejects %j",
    (value) => {
      expect(parseId(value)).toBeNull();
    }
  );

  it("rejects missing input", () => {
    expect(parseId(undefined)).toBeNull();
  });
});

describe("calculateLevelFromTotalExp", () => {
  it("levels up when a threshold is crossed and carries the remainder", () => {
    const out = calculateLevelFromTotalExp(520);
    expect(out.level).toBe(2);
    expect(out.expIntoLevel).toBe(20);
  });
});
