import { PrismaClient, Prisma } from "@prisma/client";

// Reuse the Prisma client across hot reloads to avoid exhausting database connections in dev.
const globalForPrisma = globalThis as unknown as {
  prisma?: Prisma.DefaultPrismaClient;
};

export const prisma: Prisma.DefaultPrismaClient =
  globalForPrisma.prisma ??
  (new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  }) as Prisma.DefaultPrismaClient);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
