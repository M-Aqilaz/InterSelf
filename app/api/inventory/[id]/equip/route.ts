import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setItemEquipped } from "@/lib/inventory";

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

  const body = await request.json().catch(() => null);
  const equipped = Boolean(body?.equipped);

  try {
    const entry = await setItemEquipped(user.id, inventoryId, equipped);
    return NextResponse.json(entry);
  } catch (error) {
    console.error(`POST /api/inventory/${inventoryId}/equip failed`, error);
    return NextResponse.json({ error: (error as Error).message ?? "Unable to update item" }, { status: 400 });
  }
}
