-- CreateEnum
CREATE TYPE "CharacterClass" AS ENUM ('IRONCLAD', 'SAGE', 'PHANTOM', 'MERCHANT');

-- CreateEnum
CREATE TYPE "PvpChallengeMode" AS ENUM ('TASK_COUNT', 'EXP_RACE', 'STREAK_HOLD');

-- CreateEnum
CREATE TYPE "PvpChallengeStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "characterClass" "CharacterClass",
ADD COLUMN     "classChosenAt" TIMESTAMP(3),
ADD COLUMN     "dailyChestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastDailyChestAt" TIMESTAMP(3),
ADD COLUMN     "streakShieldActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "streakShieldExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PvpChallenge" (
    "id" SERIAL NOT NULL,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "mode" "PvpChallengeMode" NOT NULL DEFAULT 'TASK_COUNT',
    "status" "PvpChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "challengerScore" INTEGER NOT NULL DEFAULT 0,
    "challengedScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "rewardCoins" INTEGER NOT NULL DEFAULT 150,
    "rewardExp" INTEGER NOT NULL DEFAULT 200,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PvpChallenge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PvpChallenge" ADD CONSTRAINT "PvpChallenge_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpChallenge" ADD CONSTRAINT "PvpChallenge_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
