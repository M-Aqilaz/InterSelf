"use client";

import { useEffect, useState, type ReactNode } from "react";

type DashboardContentRouterProps = {
  // Main grid
  characterCard: ReactNode;
  dailyQuests: ReactNode;
  bossBattlePreview: ReactNode;
  habitCalendar: ReactNode;
  weeklyChallenges: ReactNode;
  statsOverview: ReactNode;
  recentAchievements: ReactNode;
  // Detail panels
  battleDetail: ReactNode;
  statusDetail: ReactNode;
  vaultDetail: ReactNode;
  oracleDetail: ReactNode;
  arenaDetail: ReactNode;
  guildDetail: ReactNode;
};

type ActiveView = "dashboard" | "battle" | "status" | "vault" | "oracle" | "arena" | "guild" | "mission";

const HASH_TO_VIEW: Record<string, ActiveView> = {
  "": "dashboard",
  mission: "dashboard",
  battle: "battle",
  status: "status",
  vault: "vault",
  oracle: "oracle",
  arena: "arena",
  guild: "guild",
};

export function DashboardContentRouter({
  characterCard,
  dailyQuests,
  bossBattlePreview,
  habitCalendar,
  weeklyChallenges,
  statsOverview,
  recentAchievements,
  battleDetail,
  statusDetail,
  vaultDetail,
  oracleDetail,
  arenaDetail,
  guildDetail,
}: DashboardContentRouterProps) {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  useEffect(() => {
    const getView = () => {
      const hash = window.location.hash.replace("#", "");
      return HASH_TO_VIEW[hash] ?? "dashboard";
    };

    setActiveView(getView());

    const handler = () => setActiveView(getView());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // MAIN DASHBOARD GRID (default view)
  if (activeView === "dashboard") {
    return (
      <div className="flex flex-col gap-4 pb-8">
        {/* Welcome header */}
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

        {/* ROW 1: Character Card | Daily Quests | Boss Battle Preview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {characterCard}
          {dailyQuests}
          {bossBattlePreview}
        </div>

        {/* ROW 2: Habit Calendar | Weekly Challenges | Stats + Achievements */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {habitCalendar}
          {weeklyChallenges}
          <div className="flex flex-col gap-4">
            {statsOverview}
            {recentAchievements}
          </div>
        </div>
      </div>
    );
  }

  // DETAIL VIEWS (hash-routed)
  const DETAIL_PANELS: Record<Exclude<ActiveView, "dashboard" | "mission">, ReactNode> = {
    battle: battleDetail,
    status: statusDetail,
    vault: vaultDetail,
    oracle: oracleDetail,
    arena: arenaDetail,
    guild: guildDetail,
  };

  const DETAIL_TITLES: Record<Exclude<ActiveView, "dashboard" | "mission">, { label: string; desc: string }> = {
    battle: { label: "Battle Mode", desc: "Boss raids, dungeon runs, and focus combat." },
    status: { label: "Profile", desc: "Character card, stats, habits, and goals." },
    vault: { label: "Vault", desc: "Inventory, achievements, and shop." },
    oracle: { label: "Ranking", desc: "Leaderboard, analytics, and coach insight." },
    arena: { label: "Arena", desc: "PvP preview and competitive systems." },
    guild: { label: "Guild", desc: "Friends, requests, and party activity." },
  };

  const panel = DETAIL_PANELS[activeView as Exclude<ActiveView, "dashboard" | "mission">];
  const meta = DETAIL_TITLES[activeView as Exclude<ActiveView, "dashboard" | "mission">];

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Detail section header */}
      <div
        className="flex items-center justify-between rounded-2xl border p-4"
        style={{ background: "#0b0f18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(245,158,11,0.7)" }}>
            {meta?.label ?? "Section"}
          </p>
          <h1 className="mt-1 text-2xl font-black text-white">{meta?.label ?? activeView}</h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {meta?.desc ?? ""}
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)",
          }}
          onClick={() => {
            window.location.hash = "";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          ← Dashboard
        </button>
      </div>

      {panel}
    </div>
  );
}
