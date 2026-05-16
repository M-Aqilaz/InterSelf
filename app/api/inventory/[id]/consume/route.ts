import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { consumeInventoryItem } from "@/lib/inventory";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inventoryId = Number(id);

  if (Number.isNaN(inventoryId)) {
    return NextResponse.json({ error: "Invalid inventory id" }, { status: 400 });
  }

  try {
    const result = await consumeInventoryItem(user.id, inventoryId);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`POST /api/inventory/${inventoryId}/consume failed`, error);
    return NextResponse.json({ error: (error as Error).message ?? "Unable to consume item" }, { status: 400 });
  }
}
