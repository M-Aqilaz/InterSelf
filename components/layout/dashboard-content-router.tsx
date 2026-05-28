"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  characterCard: ReactNode;
  dailyQuests: ReactNode;
  bossBattlePreview: ReactNode;
  habitCalendar: ReactNode;
  weeklyChallenges: ReactNode;
  statsOverview: ReactNode;
  recentAchievements: ReactNode;
  questsDetail: ReactNode;
  battleDetail: ReactNode;
  statusDetail: ReactNode;
  vaultDetail?: ReactNode;
  oracleDetail: ReactNode;
  arenaDetail: ReactNode;
  guildDetail: ReactNode;
  inventoryDetail?: ReactNode;
  shopDetail?: ReactNode;
  achievementsDetail?: ReactNode;
};

type View = "dashboard" | "quests" | "battle" | "status" | "vault" | "oracle" | "arena" | "guild" | "inventory" | "shop" | "achievements";

const HASH_MAP: Record<string, View> = {
  "": "dashboard",
  mission: "quests",
  battle: "battle",
  status: "status",
  vault: "vault",
  oracle: "oracle",
  arena: "arena",
  guild: "guild",
  inventory: "inventory",
  shop: "shop",
  achievements: "achievements",
};

const DETAIL_META: Partial<Record<View, { label: string; desc: string }>> = {
  quests:       { label: "Quests",         desc: "Habit board, daily rituals, and custom mission CRUD." },
  battle:       { label: "Battle Mode",    desc: "Boss raids, dungeon runs, and focus combat." },
  status:       { label: "Profile",        desc: "Character card, stats, habits, and goals." },
  vault:        { label: "Vault",          desc: "Inventory, achievements, and shop." },
  oracle:       { label: "Ranking",        desc: "Leaderboard, analytics, and coach insight." },
  arena:        { label: "Arena",          desc: "PvP preview and competitive systems." },
  guild:        { label: "Guild",          desc: "Friends, requests, and party activity." },
  inventory:    { label: "Inventory",      desc: "Your equipped relics and collected items." },
  shop:         { label: "Shop",           desc: "Spend coins on boosts and items." },
  achievements: { label: "Achievements",   desc: "Your unlocked milestones and codex." },
};

export function DashboardContentRouter({
  characterCard, dailyQuests, bossBattlePreview,
  habitCalendar, weeklyChallenges, statsOverview, recentAchievements,
  questsDetail, battleDetail, statusDetail, vaultDetail, oracleDetail, arenaDetail, guildDetail,
  inventoryDetail, shopDetail, achievementsDetail,
}: Props) {
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    const update = () => {
      const hash = window.location.hash.replace("#", "");
      setView(HASH_MAP[hash] ?? "dashboard");
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  if (view === "dashboard") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 32 }}>
        <div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Welcome back,</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.1, display: "flex", alignItems: "center", gap: 8 }}>
            Adventurer!
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Level up your habits. Level up your life.
          </p>
        </div>
        <div className="dashboard-panel-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          {characterCard}
          {dailyQuests}
          {bossBattlePreview}
        </div>
        <div className="dashboard-panel-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          {habitCalendar}
          {weeklyChallenges}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {statsOverview}
            {recentAchievements}
          </div>
        </div>
      </div>
    );
  }

  const panels: Partial<Record<View, ReactNode>> = {
    quests:       questsDetail,
    battle:       battleDetail,
    status:       statusDetail,
    vault:        vaultDetail,
    oracle:       oracleDetail,
    arena:        arenaDetail,
    guild:        guildDetail,
    inventory:    inventoryDetail ?? vaultDetail,
    shop:         shopDetail ?? vaultDetail,
    achievements: achievementsDetail ?? vaultDetail,
  };

  const meta = DETAIL_META[view] ?? { label: String(view), desc: "" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 32 }}>
      <div className="dashboard-detail-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0b0f18", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
        <div>
          <p style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(245,158,11,0.7)" }}>{meta.label}</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 4 }}>{meta.label}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{meta.desc}</p>
        </div>
        <button type="button"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}
          onClick={() => { window.location.hash = ""; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          Back to Dashboard
        </button>
      </div>
      {panels[view]}
    </div>
  );
}
