import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { consumeEnergy, syncEnergy } from "@/lib/energy";
import { GameError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await consumeEnergy(user.id, 1);
    return NextResponse.json({ energy: result.energy, energyMax: result.energyMax });
  } catch (error) {
    if (error instanceof GameError) {
      const current = await syncEnergy(user.id).catch(() => null);
      return NextResponse.json(
        { error: error.message, energy: current?.energy ?? 0 },
        { status: error.status }
      );
    }
    console.error("POST /api/energy/use failed", error);
    return NextResponse.json({ error: "Unable to use energy" }, { status: 500 });
  }
}
