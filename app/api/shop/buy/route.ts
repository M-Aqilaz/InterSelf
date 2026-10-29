import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";
import { GameError } from "@/lib/errors";
import { errorResponse } from "@/lib/api";

const MAX_QUANTITY = 99;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const itemId = Number(body?.itemId);
  const quantity = Number(body?.quantity ?? 1);

  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return NextResponse.json(
      { error: `quantity must be a whole number from 1 to ${MAX_QUANTITY}` },
      { status: 400 }
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) throw new GameError("Item not found", 404);
      if (item.price <= 0) throw new GameError("Item tidak dijual", 400);

      const totalCost = item.price * quantity;

      // Balance check and deduction in one statement: coins can never go negative,
      // even with simultaneous purchases.
      const paid = await tx.profile.updateMany({
        where: { userId: user.id, coins: { gte: totalCost } },
        data: { coins: { decrement: totalCost } },
      });
      if (paid.count === 0) {
        const profile = await tx.profile.findUnique({
          where: { userId: user.id },
          select: { coins: true },
        });
        if (!profile) throw new GameError("Profile not found", 404);
        throw new GameError(
          `Coins tidak cukup. Butuh ${totalCost}, kamu punya ${profile.coins}`,
          400
        );
      }

      await tx.userInventory.upsert({
        where: { userId_itemId: { userId: user.id, itemId } },
        create: { userId: user.id, itemId, quantity },
        update: { quantity: { increment: quantity } },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: ActivityType.ITEM_EARNED,
          description: `Membeli ${quantity}x ${item.name}`,
          metadata: { itemId, itemName: item.name, quantity, cost: totalCost },
        },
      });

      const remaining = await tx.profile.findUniqueOrThrow({
        where: { userId: user.id },
        select: { coins: true },
      });

      return NextResponse.json({
        success: true,
        item: { id: item.id, name: item.name, rarity: item.rarity },
        quantity,
        totalCost,
        remainingCoins: remaining.coins,
      });
    });
  } catch (error) {
    return errorResponse(error, "POST /api/shop/buy failed", "Unable to complete purchase");
  }
}
