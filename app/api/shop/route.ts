import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — ambil semua item yang bisa dibeli (price > 0)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ambil semua item yang dijual
  const items = await prisma.inventoryItem.findMany({
    where: { price: { gt: 0 } },
    orderBy: { price: "asc" },
  });

  // Ambil inventory user untuk cek stok yang sudah dimiliki
  const userInventory = await prisma.userInventory.findMany({
    where: { userId: user.id },
    include: { item: true },
  });

  // Coins user
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { coins: true },
  });

  const inventoryMap = new Map(
    userInventory.map((inv) => [inv.itemId, inv.quantity])
  );

  const shopItems = items.map((item) => ({
    ...item,
    owned: inventoryMap.get(item.id) ?? 0,
    canAfford: (profile?.coins ?? 0) >= item.price,
  }));

  return NextResponse.json({
    items: shopItems,
    userCoins: profile?.coins ?? 0,
  });
}
