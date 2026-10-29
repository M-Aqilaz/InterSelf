import { NextResponse } from "next/server";
import { GameError } from "@/lib/errors";

/** Strict positive integer from a route param; rejects "1.5", "1e3", "Infinity", "", "-4". */
export function parseId(value: string | undefined | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** Map a thrown error to a JSON response; unknown errors become a logged 500. */
export function errorResponse(error: unknown, context: string, fallback = "Something went wrong") {
  if (error instanceof GameError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(context, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
