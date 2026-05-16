import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BossBattlePanel } from "@/components/sections/boss-battle";
import { AchievementsPanel } from "@/components/sections/achievements-panel";
import { InventoryPanel } from "@/components/sections/inventory-panel";
import { LeaderboardPanel } from "@/components/sections/leaderboard-panel";
import { FriendsPanel } from "@/components/sections/friends-panel";
import { WeeklyChallengesPanel } from "@/components/sections/weekly-challenges-panel";
import { DailyTasksPanel } from "@/components/sections/daily-tasks-panel";
import { CharacterProfilePanel } from "@/components/sections/character-profile-panel";
import { PvpPreviewPanel } from "@/components/sections/pvp-preview-panel";
import { DungeonNavigationPanel } from "@/components/sections/dungeon-navigation-panel";
import { FocusModePanel } from "@/components/sections/focus-mode-panel";
import { ProductivityAnalyticsPanel } from "@/components/sections/productivity-analytics-panel";
import { HabitTrackerPanel } from "@/components/sections/habit-tracker-panel";
import { GoalPlannerPanel } from "@/components/sections/goal-planner-panel";
import { AiCoachPanel } from "@/components/sections/ai-coach-panel";
import { TodayMissionHero } from "@/components/sections/today-mission-hero";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";
import { startOfToday } from "@/lib/time";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const today = startOfToday();

  const [profileRecord, equippedRelics, tasks, todayCompletions] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.userInventory.findMany({
      where: { userId: user.id, equipped: true },
      include: { item: true },
      orderBy: { acquiredAt: "desc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: {
        OR: [{ isSystem: true }, { createdById: user.id }],
      },
      select: { id: true, title: true, createdAt: true, isSystem: true },
      orderBy: [
        { isSystem: "desc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.taskCompletion.findMany({
      where: {
        userId: user.id,
        completedAt: { gte: today },
      },
      select: { taskId: true },
    }),
  ]);

  const stats = user.stats ?? [];
  const profileExp = profileRecord?.exp ?? 0;
  const levelProgress = calculateLevelFromTotalExp(profileExp);
  const powerScore = Math.round((profileRecord?.level ?? levelProgress.level) * 120 + (profileRecord?.coins ?? 0) / 150 + stats.reduce((acc, stat) => acc + stat.value, 0));
  const equippedSlots = equippedRelics.map((entry, index) => ({
    slot: ["Core Relic", "Augment", "Support"][index] ?? `Slot ${index + 1}`,
    item: entry.item
      ? {
          id: entry.item.id,
          name: entry.item.name,
          rarity: entry.item.rarity,
          description: entry.item.description,
        }
      : null,
  }));

  const completedTaskIds = new Set(todayCompletions.map((entry) => entry.taskId));
  const totalTasks = tasks.length;
  const completedToday = completedTaskIds.size;
  const dailyCompletionPercent = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;
  const nextMission = tasks.find((task) => !completedTaskIds.has(task.id))?.title ?? "Win the day with focused progress";
  const streakValue = profileRecord?.streak ?? 0;
  const bestStreakValue = profileRecord?.bestStreak ?? 1;
  const energyPercent = Math.min(100, Math.max(20, Math.round((streakValue / Math.max(1, bestStreakValue)) * 80 + 20)));
  const heroLevel = profileRecord?.level ?? levelProgress.level;
  const heroRank = user.profile?.rank ?? "BRONZE";
  const heroExpPercent = levelProgress.expForNextLevel > 0 ? Math.min(100, Math.round((levelProgress.expIntoLevel / levelProgress.expForNextLevel) * 100)) : 0;

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-6 lg:max-w-7xl lg:gap-8">
      <section id="today" className="w-full">
        <TodayMissionHero
          username={user.profile?.username ?? user.name ?? "Hunter"}
          missionTitle={nextMission}
          dailyCompletion={dailyCompletionPercent}
          streak={streakValue}
          level={heroLevel}
          expPercent={heroExpPercent}
          rank={heroRank}
          energyPercent={energyPercent}
        />
      </section>

      <section id="focus" className="w-full">
        <FocusModePanel />
      </section>

      <section id="progress" className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Daily progression</h2>
            <p className="text-sm text-white/70">Your actionable plan for today.</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-3">
            <DailyTasksPanel />
            <HabitTrackerPanel />
            <GoalPlannerPanel />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Character progression</h2>
            <p className="text-sm text-white/70">EXP, rank, and boss pressure as motivation.</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <CharacterProfilePanel
              username={user.profile?.username ?? user.name ?? "Hunter"}
              title={user.profile?.title ?? "Awakened"}
              rank={heroRank}
              level={heroLevel}
              expIntoLevel={levelProgress.expIntoLevel}
              expForNextLevel={levelProgress.expForNextLevel}
              coins={profileRecord?.coins ?? 0}
              streak={streakValue}
              bestStreak={profileRecord?.bestStreak ?? 0}
              powerScore={powerScore}
              equippedSlots={equippedSlots}
              stats={stats.map((stat) => ({ type: stat.type, value: stat.value }))}
            />
            <div className="grid grid-cols-1 gap-6">
              <BossBattlePanel />
              <WeeklyChallengesPanel />
            </div>
          </div>
        </div>
      </section>

      <section id="insights" className="flex w-full flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">Productivity insights</h2>
          <p className="text-sm text-white/70">Guidance and analytics to stay on track.</p>
        </div>
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <AiCoachPanel />
          <ProductivityAnalyticsPanel />
        </div>
      </section>

      <section id="rewards" className="flex w-full flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Rewards & social layer</h2>
          <p className="text-sm text-white/70">Use RPG systems as motivation and celebration.</p>
        </div>
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <InventoryPanel />
          <AchievementsPanel />
        </div>
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <LeaderboardPanel />
          <FriendsPanel />
        </div>
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2" id="exploration">
          <DungeonNavigationPanel />
          <PvpPreviewPanel />
        </div>
      </section>
    </div>
  );
}
