import { ActivityType, ItemRarity, Prisma, TaskCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";
import type { ProfileWithBoss } from "@/lib/boss";

export type InventoryEntry = Prisma.UserInventoryGetPayload<{ include: { item: true } }>;
export type InventoryViewModel = InventoryEntry & {
  isConsumable: boolean;
  isEquippable: boolean;
};

type PassiveEffectContext = {
  expReward: number;
  coinReward: number;
  taskCategory: TaskCategory;
};

type PassiveEffectResult = {
  expReward: number;
  coinReward: number;
  inventory: InventoryViewModel[];
  passiveLogs: string[];
};

const CONSUMABLE_ITEM_NAMES = new Set([
  "Ion Surge Vial",
  "XP Surge",
  "Boss Orb",
  "Coin Magnet",
  "Streak Freeze",
]);
const EQUIPPABLE_ITEM_NAMES = new Set([
  "Chrono Lens",
  "Aurora Gauntlets",
  "Vault Prism",
  "Neural Overclocker",
]);

const CONSUMABLE_EFFECTS: Record<string, { expGain?: number; coinGain?: number; special?: string }> = {
  "Ion Surge Vial": { expGain: 150 },
  "XP Surge": { special: "xp_boost_2h" },
  "Boss Orb": { special: "boss_damage_500" },
  "Coin Magnet": { special: "coin_boost_1h" },
  "Streak Freeze": { special: "streak_freeze" },
};

const EQUIPPABLE_EFFECTS: Record<
  string,
  {
    expMultiplier?: number;
    coinMultiplier?: number;
    categoryFilter?: TaskCategory[];
  }
> = {
  "Chrono Lens": { expMultiplier: 0.1, categoryFilter: [TaskCategory.FOCUS] },
  "Aurora Gauntlets": { expMultiplier: 0.15, coinMultiplier: 0.15, categoryFilter: [TaskCategory.WORKOUT] },
  "Vault Prism": { coinMultiplier: 0.1 },
  "Neural Overclocker": { expMultiplier: 0.12, categoryFilter: [TaskCategory.FOCUS] },
};

export const withMeta = (entry: InventoryEntry): InventoryViewModel => ({
  ...entry,
  isConsumable: entry.item ? CONSUMABLE_ITEM_NAMES.has(entry.item.name) : false,
  isEquippable: entry.item ? EQUIPPABLE_ITEM_NAMES.has(entry.item.name) : false,
});

export async function fetchInventory(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<InventoryViewModel[]> {
  const raw = await tx.userInventory.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { acquiredAt: "asc" },
  });

  return raw.map(withMeta);
}

export async function applyPassiveEffects(
  tx: Prisma.TransactionClient,
  userId: string,
  context: PassiveEffectContext
): Promise<PassiveEffectResult> {
  const inventory = await fetchInventory(tx, userId);
  const equipped = inventory.filter((entry) => entry.equipped && entry.item);

  let expReward = context.expReward;
  let coinReward = context.coinReward;
  const passiveLogs: string[] = [];

  for (const entry of equipped) {
    const effect = entry.item ? EQUIPPABLE_EFFECTS[entry.item.name] : undefined;
    if (!effect) continue;

    const appliesToCategory = effect.categoryFilter
      ? effect.categoryFilter.includes(context.taskCategory)
      : true;

    if (!appliesToCategory) {
      continue;
    }

    if (effect.expMultiplier) {
      expReward += expReward * effect.expMultiplier;
      passiveLogs.push(`${entry.item.name} boosted EXP by ${(effect.expMultiplier * 100).toFixed(0)}%`);
    }

    if (effect.coinMultiplier) {
      coinReward += coinReward * effect.coinMultiplier;
      passiveLogs.push(`${entry.item.name} boosted coins by ${(effect.coinMultiplier * 100).toFixed(0)}%`);
    }
  }

  return {
    expReward: Math.round(expReward),
    coinReward: Math.round(coinReward),
    inventory,
    passiveLogs,
  };
}

export async function ensureInventoryCapacity(
  tx: Prisma.TransactionClient,
  userId: string,
  itemId: number,
  quantity: number
) {
  await tx.userInventory.upsert({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    create: {
      userId,
      itemId,
      quantity,
    },
    update: {
      quantity: { increment: quantity },
    },
  });
}

export async function consumeInventoryItem(userId: string, userInventoryId: number) {
  return prisma.$transaction(async (tx) => {
    const entry = await tx.userInventory.findUnique({
      where: { id: userInventoryId },
      include: { item: true },
    });

    if (!entry || entry.userId !== userId) {
      throw new Error("Item not found");
    }

    if (!entry.item) {
      throw new Error("Item metadata missing");
    }

    if (entry.quantity <= 0) {
      throw new Error("No quantity remaining");
    }

    const effect = CONSUMABLE_EFFECTS[entry.item.name];
    if (!effect) {
      throw new Error("Item is not consumable");
    }

    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error("Profile not found");
    }

    const totalExp = profile.exp + (effect.expGain ?? 0);
    const levelProgress = calculateLevelFromTotalExp(totalExp);

    const updatedProfile = await tx.profile.update({
      where: { userId },
      data: {
        exp: totalExp,
        level: levelProgress.level,
        coins: { increment: effect.coinGain ?? 0 },
      },
      include: { currentBoss: { include: { rewardItem: true } } },
    });

    await tx.userInventory.update({
      where: { id: entry.id },
      data: {
        quantity: entry.quantity - 1,
      },
    });

    // Apply special item effects
    const specialEffect = effect.special
      ? await applySpecialItemEffect(tx, userId, entry.item.name)
      : { message: `Consumed ${entry.item.name}`, applied: false };

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.ITEM_EARNED,
        description: specialEffect.applied ? specialEffect.message : `Consumed ${entry.item.name}`,
        metadata: {
          itemId: entry.itemId,
          expGain: effect.expGain ?? 0,
          specialEffect: specialEffect.applied ? specialEffect.message : undefined,
        },
      },
    });

    return {
      profile: updatedProfile as ProfileWithBoss,
      levelProgress,
      effectMessage: specialEffect.message,
    };
  });
}

export async function setItemEquipped(userId: string, userInventoryId: number, equipped: boolean) {
  return prisma.$transaction(async (tx) => {
    const entry = await tx.userInventory.findUnique({
      where: { id: userInventoryId },
      include: { item: true },
    });

    if (!entry || entry.userId !== userId) {
      throw new Error("Item not found");
    }

    if (!entry.item) {
      throw new Error("Item metadata missing");
    }

    if (!EQUIPPABLE_EFFECTS[entry.item.name]) {
      throw new Error("Item cannot be equipped");
    }

    const updated = await tx.userInventory.update({
      where: { id: entry.id },
      data: { equipped },
      include: { item: true },
    });

    await tx.activityLog.create({
      data: {
        userId,
        type: ActivityType.ITEM_EARNED,
        description: `${equipped ? "Equipped" : "Unequipped"} ${entry.item.name}`,
        metadata: {
          itemId: entry.itemId,
          equipped,
        },
      },
    });

    return withMeta(updated);
  });
}

export async function getInventoryForUser(userId: string): Promise<InventoryViewModel[]> {
  const raw = await prisma.userInventory.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { acquiredAt: "asc" },
  });

  return raw.map(withMeta);
}

export function summarizeInventory(inventory: InventoryViewModel[]) {
  const totalItems = inventory.reduce((sum, entry) => sum + entry.quantity, 0);
  const legendaryEquipped = inventory.some(
    (entry) => entry.equipped && entry.item?.rarity === ItemRarity.LEGENDARY
  );

  return {
    totalItems,
    legendaryEquipped,
  };
}

export async function applySpecialItemEffect(
  tx: Prisma.TransactionClient,
  userId: string,
  itemName: string
): Promise<{ message: string; applied: boolean }> {
  switch (itemName) {
    case "Streak Freeze": {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await tx.profile.update({
        where: { userId },
        data: {
          streakShieldActive: true,
          streakShieldExpiry: expiry,
        },
      });
      return { message: "Streak Shield aktif selama 24 jam", applied: true };
    }

    case "Boss Orb": {
      const progress = await tx.userBossProgress.findFirst({
        where: { userId, status: "ACTIVE" },
        orderBy: { id: "desc" },
      });
      if (!progress) return { message: "Tidak ada boss aktif", applied: false };

      const newHp = Math.max(0, progress.currentHp - 500);
      await tx.userBossProgress.update({
        where: { id: progress.id },
        data: {
          currentHp: newHp,
          lastDamagedAt: new Date(),
          status: newHp === 0 ? "VICTORIOUS" : "ACTIVE",
        },
      });
      return { message: `Boss terkena -500 DMG! HP tersisa: ${newHp}`, applied: true };
    }

    case "XP Surge":
    case "Coin Magnet": {
      return { message: `${itemName} aktif selama 2 jam`, applied: true };
    }

    default:
      return { message: "Efek tidak dikenal", applied: false };
  }
}
