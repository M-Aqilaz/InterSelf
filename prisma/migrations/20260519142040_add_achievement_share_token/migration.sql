/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `UserAchievement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserAchievement" ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_shareToken_key" ON "UserAchievement"("shareToken");
