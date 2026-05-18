import type { Prisma } from "@prisma/client";
import { BASE_STAT_TYPES } from "@/lib/constants";
import { assignInitialBoss } from "@/lib/boss";

export async function createUserGameRecords(
  tx: Prisma.TransactionClient,
  userId: string,
  username: string
) {
  await tx.profile.upsert({
    where: { userId },
    create: {
      userId,
      username,
    },
    update: {},
  });

  await tx.stat.createMany({
    data: BASE_STAT_TYPES.map((type) => ({
      userId,
      type,
      value: 0,
    })),
    skipDuplicates: true,
  });

  await assignInitialBoss(tx, userId);
}
