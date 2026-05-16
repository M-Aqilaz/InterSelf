import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getInventoryForUser, summarizeInventory } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inventory = await getInventoryForUser(user.id);
  const summary = summarizeInventory(inventory);

  return NextResponse.json({ inventory, summary });
}
