-- Fix typo in BossStatus enum
ALTER TYPE "BossStatus" RENAME VALUE 'DEFATED' TO 'DEFEATED';

-- Day-based streak tracking and timed item boosts
ALTER TABLE "Profile"
  ADD COLUMN "lastStreakDate" TIMESTAMP(3),
  ADD COLUMN "xpBoostUntil" TIMESTAMP(3),
  ADD COLUMN "coinBoostUntil" TIMESTAMP(3);

-- Old streak values were incremented per task (not per day) and never reset,
-- so they are not meaningful under the day-based rules. Start everyone from zero.
UPDATE "Profile" SET "streak" = 0, "bestStreak" = 0;

-- One completion per user + task + day (NULL for historic rows, which Postgres treats as distinct)
ALTER TABLE "TaskCompletion" ADD COLUMN "completedDay" TEXT;
CREATE UNIQUE INDEX "TaskCompletion_userId_taskId_completedDay_key"
  ON "TaskCompletion"("userId", "taskId", "completedDay");
