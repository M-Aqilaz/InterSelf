import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { refreshEnergyWithGems } from "@/lib/gems";
import { GameError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await refreshEnergyWithGems(user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GameError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/energy/refresh failed", error);
    return NextResponse.json({ error: "Unable to refresh energy" }, { status: 500 });
  }
}
