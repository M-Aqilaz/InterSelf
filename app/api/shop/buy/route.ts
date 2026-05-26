import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const itemId = Number(body?.itemId);
  const quantity = Math.max(1, Number(body?.quantity ?? 1));

  if (!itemId || isNaN(itemId)) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    // Ambil item
    const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.price <= 0) {
      return NextResponse.json({ error: "Item tidak dijual" }, { status: 400 });
    }

    const totalCost = item.price * quantity;

    // Cek coins user
    const profile = await tx.profile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.coins < totalCost) {
      return NextResponse.json(
        { error: `Coins tidak cukup. Butuh ${totalCost}, kamu punya ${profile.coins}` },
        { status: 400 }
      );
    }

    // Kurangi coins
    const updatedProfile = await tx.profile.update({
      where: { userId: user.id },
      data: { coins: { decrement: totalCost } },
    });

    // Tambah ke inventory (upsert supaya tidak duplikat)
    await tx.userInventory.upsert({
      where: { userId_itemId: { userId: user.id, itemId } },
      create: { userId: user.id, itemId, quantity },
      update: { quantity: { increment: quantity } },
    });

    // Log aktivitas
    await tx.activityLog.create({
      data: {
        userId: user.id,
        type: ActivityType.ITEM_EARNED,
        description: `Membeli ${quantity}x ${item.name}`,
        metadata: { itemId, itemName: item.name, quantity, cost: totalCost },
      },
    });

    return NextResponse.json({
      success: true,
      item: { id: item.id, name: item.name, rarity: item.rarity },
      quantity,
      totalCost,
      remainingCoins: updatedProfile.coins,
    });
  });
}
