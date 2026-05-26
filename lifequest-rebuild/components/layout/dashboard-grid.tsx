"use client";

import type { ReactNode } from "react";

// This component replaces the old tab-based dashboard-tabs.tsx
// It renders the main 3-column grid layout matching the mockup

type DashboardGridProps = {
  // Row 1 (top)
  characterCard: ReactNode;
  dailyQuests: ReactNode;
  bossBattlePreview: ReactNode;
  // Row 2 (bottom)
  habitCalendar: ReactNode;
  weeklyChallenges: ReactNode;
  statsAndAchievements: ReactNode;
  // Detail panels (shown via hash navigation, NOT on main dashboard grid)
  battleDetail?: ReactNode;
  statusDetail?: ReactNode;
  vaultDetail?: ReactNode;
  oracleDetail?: ReactNode;
  arenaDetail?: ReactNode;
  guildDetail?: ReactNode;
};

export function DashboardGrid({
  characterCard,
  dailyQuests,
  bossBattlePreview,
  habitCalendar,
  weeklyChallenges,
  statsAndAchievements,
  battleDetail,
  statusDetail,
  vaultDetail,
  oracleDetail,
  arenaDetail,
  guildDetail,
}: DashboardGridProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Welcome row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Welcome back,
          </p>
          <h1 className="flex items-center gap-2 text-2xl font-black text-white">
            Adventurer! <span>⚔️</span>
          </h1>
          <p className="mt-[2px] text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Level up your habits. Level up your life.
          </p>
        </div>
      </div>

      {/* ROW 1: Character | Daily Quests | Boss Battle */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div>{characterCard}</div>
        <div>{dailyQuests}</div>
        <div>{bossBattlePreview}</div>
      </div>

      {/* ROW 2: Habit Calendar | Weekly Challenge | Stats+Achievements */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div>{habitCalendar}</div>
        <div>{weeklyChallenges}</div>
        <div className="flex flex-col gap-4">
          {statsAndAchievements}
        </div>
      </div>
    </div>
  );
}
