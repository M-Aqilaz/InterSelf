import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";
import { startOfToday } from "@/lib/time";
import { ClassGate } from "@/components/layout/class-gate";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CharacterCard } from "@/components/sections/character-card";
import { DailyQuestsPanel } from "@/components/sections/daily-quests-panel";
import { BossBattlePreview } from "@/components/sections/boss-battle-preview";
import { HabitCalendarPanel } from "@/components/sections/habit-calendar-panel";
import { WeeklyChallengesPanel } from "@/components/sections/weekly-challenges-panel";
import { StatsOverviewPanel, RecentAchievementsPanel } from "@/components/sections/stats-and-achievements";
import dynamic from "next/dynamic";

// Detail panels (lazy loaded, shown via hash navigation)
const BossBattlePanel = dynamic(
  () => import("@/components/sections/boss-battle").then((m) => m.BossBattlePanel),
  { loading: () => <PanelSkeleton /> }
);
const CharacterProfilePanel = dynamic(
  () => import("@/components/sections/character-profile-panel").then((m) => m.CharacterProfilePanel),
  { loading: () => <PanelSkeleton /> }
);
const InventoryPanel = dynamic(
  () => import("@/components/sections/inventory-panel").then((m) => m.InventoryPanel),
  { loading: () => <PanelSkeleton /> }
);
const ShopPanel = dynamic(
  () => import("@/components/sections/shop-panel").then((m) => m.ShopPanel),
  { loading: () => <PanelSkeleton /> }
);
const AchievementsPanel = dynamic(
  () => import("@/components/sections/achievements-panel").then((m) => m.AchievementsPanel),
  { loading: () => <PanelSkeleton /> }
);
const LeaderboardPanel = dynamic(
  () => import("@/components/sections/leaderboard-panel").then((m) => m.LeaderboardPanel),
  { loading: () => <PanelSkeleton /> }
);
const FriendsPanel = dynamic(
  () => import("@/components/sections/friends-panel").then((m) => m.FriendsPanel),
  { loading: () => <PanelSkeleton /> }
);
const DungeonNavigationPanel = dynamic(
  () => import("@/components/sections/dungeon-navigation-panel").then((m) => m.DungeonNavigationPanel),
  { loading: () => <PanelSkeleton /> }
);
const PvpPreviewPanel = dynamic(
  () => import("@/components/sections/pvp-preview-panel").then((m) => m.PvpPreviewPanel),
  { loading: () => <PanelSkeleton /> }
);
const HabitTrackerPanel = dynamic(
  () => import("@/components/sections/habit-tracker-panel").then((m) => m.HabitTrackerPanel),
  { loading: () => <PanelSkeleton /> }
);
const GoalPlannerPanel = dynamic(
  () => import("@/components/sections/goal-planner-panel").then((m) => m.GoalPlannerPanel),
  { loading: () => <PanelSkeleton /> }
);
const ProductivityAnalyticsPanel = dynamic(
  () => import("@/components/sections/productivity-analytics-panel").then((m) => m.ProductivityAnalyticsPanel),
  { loading: () => <PanelSkeleton /> }
);
const QuestBoardPanel = dynamic(
  () => import("@/components/sections/quest-board-panel").then((m) => m.QuestBoardPanel),
  { loading: () => <PanelSkeleton /> }
);
const AiCoachPanel = dynamic(
  () => import("@/components/sections/ai-coach-panel").then((m) => m.AiCoachPanel),
  { loading: () => <PanelSkeleton /> }
);
const FocusModePanel = dynamic(
  () => import("@/components/sections/focus-mode-panel").then((m) => m.FocusModePanel),
  { loading: () => <PanelSkeleton /> }
);

function PanelSkeleton() {
  return (
    <div
      className="h-48 animate-pulse rounded-2xl"
      style={{ background: "rgba(255,255,255,0.03)" }}
    />
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = startOfToday();

  type ProfileRecord = Awaited<ReturnType<typeof prisma.profile.findUnique>>;
  type EquippedRelic = {
    item: { id: number; name: string; rarity: string; description: string } | null;
  };
  type TaskRecord = { id: number; title: string; createdAt: Date; isSystem: boolean };
  type TodayCompletion = { taskId: number };

  let profileRecord: ProfileRecord = null;
  let equippedRelics: EquippedRelic[] = [];
  let tasks: TaskRecord[] = [];
  let todayCompletions: TodayCompletion[] = [];

  try {
    [profileRecord, equippedRelics, tasks, todayCompletions] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.userInventory.findMany({
        where: { userId: user.id, equipped: true },
        include: { item: true },
        orderBy: { acquiredAt: "desc" },
        take: 3,
      }),
      prisma.task.findMany({
        where: { OR: [{ isSystem: true }, { createdById: user.id }] },
        select: { id: true, title: true, createdAt: true, isSystem: true },
        orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
      }),
      prisma.taskCompletion.findMany({
        where: { userId: user.id, completedAt: { gte: today } },
        select: { taskId: true },
      }),
    ]);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
  }

  const hasChosenClass =
    profileRecord?.characterClass !== null && profileRecord?.characterClass !== undefined;

  const stats = user.stats ?? [];
  const profileExp = profileRecord?.exp ?? 0;
  const levelProgress = calculateLevelFromTotalExp(profileExp);
  const heroLevel = profileRecord?.level ?? levelProgress.level;
  const streakValue = profileRecord?.streak ?? 0;
  const bestStreakValue = profileRecord?.bestStreak ?? 0;
  const heroCoins = profileRecord?.coins ?? 0;
  const heroGems = profileRecord?.gems ?? 500;
  const heroEnergy = profileRecord?.energy ?? 5;
  const heroEnergyMax = profileRecord?.energyMax ?? 5;
  const heroRank = user.profile?.rank ?? "BRONZE";
  const characterClass = profileRecord?.characterClass ?? null;

  const completedTaskIds = new Set(todayCompletions.map((c) => c.taskId));
  const totalTasks = tasks.length;
  const completedToday = completedTaskIds.size;
  const dailyCompletionPercent = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  const equippedSlots = equippedRelics.map((entry, index) => ({
    slot: ["Core Relic", "Augment", "Support"][index] ?? `Slot ${index + 1}`,
    item: entry.item
      ? { id: entry.item.id, name: entry.item.name, rarity: entry.item.rarity, description: entry.item.description }
      : null,
  }));

  const powerScore = Math.round(
    heroLevel * 120 +
      heroCoins / 150 +
      stats.reduce((acc, stat) => acc + stat.value, 0)
  );

  // Build completion heatmap for calendar (last 3 months)
  const calendarCompletions = await prisma.taskCompletion
    .findMany({
      where: {
        userId: user.id,
        completedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: { completedAt: true },
    })
    .catch(() => []);

  const completionsByDate: Record<string, number> = {};
  for (const c of calendarCompletions) {
    const key = c.completedAt.toISOString().slice(0, 10);
    completionsByDate[key] = (completionsByDate[key] ?? 0) + 1;
  }

  // Stats for overview (this week)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekCompletions = calendarCompletions.filter((c) => c.completedAt >= oneWeekAgo);
  const habitsThisWeek = weekCompletions.length;
  const expThisWeek = habitsThisWeek * 30;
  const coinsThisWeek = habitsThisWeek * 12;

  return (
    <ClassGate hasChosenClass={hasChosenClass}>
      <div className="flex min-h-screen flex-col" style={{ background: "#080b12" }}>
        {/* TOPBAR */}
        <DashboardTopbar
          coins={heroCoins}
          gems={heroGems}
          energy={heroEnergy}
          energyMax={heroEnergyMax}
          characterClass={characterClass}
        />

        {/* BODY: Sidebar + Main */}
        <div className="flex flex-1">
          {/* SIDEBAR */}
          <DashboardSidebar
            username={user.profile?.username ?? user.name ?? "Hunter"}
            title={user.profile?.title ?? "Awakened"}
            level={heroLevel}
            coins={heroCoins}
            expIntoLevel={levelProgress.expIntoLevel}
            expForNextLevel={levelProgress.expForNextLevel}
            characterClass={characterClass}
          />

          {/* MAIN CONTENT */}
          <main className="min-w-0 flex-1 overflow-y-auto px-5 py-5">
            {/*
              The DashboardContentRouter is a client component that reads window.location.hash
              and shows either the main dashboard grid or a detail panel.
              This avoids full page reloads and keeps all data server-fetched.
            */}
            <DashboardContentRouter
              // Main grid panels
              characterCard={
                <CharacterCard
                  username={user.profile?.username ?? user.name ?? "Hunter"}
                  title={user.profile?.title ?? "Awakened"}
                  level={heroLevel}
                  expIntoLevel={levelProgress.expIntoLevel}
                  expForNextLevel={levelProgress.expForNextLevel}
                  coins={heroCoins}
                  characterClass={characterClass}
                />
              }
              dailyQuests={
                <DailyQuestsPanel
                  tasks={tasks.map((t) => ({ id: t.id, title: t.title, isSystem: t.isSystem }))}
                  completedTaskIds={completedTaskIds}
                />
              }
              bossBattlePreview={
                <BossBattlePreview productivityCompletion={dailyCompletionPercent} />
              }
              habitCalendar={
                <HabitCalendarPanel
                  completionsByDate={completionsByDate}
                  bestStreak={bestStreakValue}
                />
              }
              weeklyChallenges={<WeeklyChallengesPanel />}
              statsOverview={
                <StatsOverviewPanel
                  habitsCompleted={habitsThisWeek}
                  totalExp={expThisWeek}
                  coinsEarned={coinsThisWeek}
                  streak={streakValue}
                />
              }
              recentAchievements={<RecentAchievementsPanel />}
              // Detail panels
              questsDetail={<QuestBoardPanel />}
              battleDetail={<BossBattlePanel productivityCompletion={dailyCompletionPercent} />}
              statusDetail={
                <div className="grid gap-4 xl:grid-cols-2">
                  <CharacterProfilePanel
                    username={user.profile?.username ?? user.name ?? "Hunter"}
                    title={user.profile?.title ?? "Awakened"}
                    rank={heroRank}
                    level={heroLevel}
                    expIntoLevel={levelProgress.expIntoLevel}
                    expForNextLevel={levelProgress.expForNextLevel}
                    coins={heroCoins}
                    streak={streakValue}
                    bestStreak={bestStreakValue}
                    powerScore={powerScore}
                    equippedSlots={equippedSlots}
                    stats={stats.map((s) => ({ type: s.type, value: s.value }))}
                    characterClass={characterClass}
                  />
                  <div className="flex flex-col gap-4">
                    <HabitTrackerPanel />
                    <GoalPlannerPanel />
                  </div>
                </div>
              }
              vaultDetail={<InventoryPanel />}
              inventoryDetail={<InventoryPanel />}
              shopDetail={<ShopPanel />}
              achievementsDetail={<AchievementsPanel />}
              oracleDetail={
                <>
                  <LeaderboardPanel />
                  <ProductivityAnalyticsPanel />
                </>
              }
              arenaDetail={<PvpPreviewPanel />}
              guildDetail={<FriendsPanel />}
            />
          </main>
        </div>
      </div>
    </ClassGate>
  );
}

// â”€â”€â”€ CLIENT COMPONENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { DashboardContentRouter } from "@/components/layout/dashboard-content-router";



