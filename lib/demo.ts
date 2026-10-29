import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { createUserGameRecords } from "@/lib/user-provisioning";
import { DAY_MS, startOfToday } from "@/lib/time";

/** Every demo account uses this domain, which is also how old ones are found and cleaned up. */
export const DEMO_EMAIL_DOMAIN = "demo.interself.app";
const DEMO_TTL_MS = 24 * 60 * 60 * 1000;
const PRUNE_BATCH = 50;

/** Items every demo visitor starts with (matched by name; missing ones are skipped). */
const DEMO_STARTER_ITEMS: Array<{ name: string; quantity: number }> = [
  { name: "XP Surge", quantity: 1 },
  { name: "Streak Freeze", quantity: 1 },
  { name: "Ion Surge Vial", quantity: 2 },
];

export function isDemoLoginEnabled() {
  return process.env.DEMO_LOGIN_ENABLED !== "false";
}

/**
 * Create a fresh, isolated sandbox account for one visitor: class already chosen,
 * a few levels in, a running streak and some items, so the dashboard looks alive immediately.
 * Each visitor gets their own account, so people never see or break each others progress.
 */
export async function createDemoUser() {
  const suffix = randomBytes(4).toString("hex");
  const username = `demo_${suffix}`;
  const yesterday = new Date(startOfToday().getTime() - DAY_MS);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: `${username}@${DEMO_EMAIL_DOMAIN}`, name: "Demo Hunter" },
    });

    await createUserGameRecords(tx, user.id, username);

    await tx.profile.update({
      where: { userId: user.id },
      data: {
        characterClass: "SAGE",
        classChosenAt: new Date(),
        exp: 1300,
        level: 3,
        coins: 400,
        streak: 3,
        bestStreak: 3,
        // Yesterday, so finishing a task today extends the streak to 4.
        lastStreakDate: yesterday,
        totalCompletedTasks: 6,
      },
    });

    const items = await tx.inventoryItem.findMany({
      where: { name: { in: DEMO_STARTER_ITEMS.map((item) => item.name) } },
    });
    for (const item of items) {
      const quantity = DEMO_STARTER_ITEMS.find((starter) => starter.name === item.name)?.quantity ?? 1;
      await tx.userInventory.create({ data: { userId: user.id, itemId: item.id, quantity } });
    }

    return user;
  });
}

/** Delete demo accounts older than a day so the database does not fill up. Best effort. */
export async function pruneExpiredDemoUsers() {
  const stale = await prisma.user.findMany({
    where: {
      email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` },
      createdAt: { lt: new Date(Date.now() - DEMO_TTL_MS) },
    },
    select: { id: true },
    take: PRUNE_BATCH,
  });
  if (stale.length === 0) return 0;

  const ids = stale.map((user) => user.id);
  await prisma.$transaction(async (tx) => {
    // Profile has no cascade from User, so it goes first; everything else cascades.
    await tx.profile.deleteMany({ where: { userId: { in: ids } } });
    await tx.task.deleteMany({ where: { createdById: { in: ids }, isSystem: false } });
    await tx.user.deleteMany({ where: { id: { in: ids } } });
  });
  return ids.length;
}
