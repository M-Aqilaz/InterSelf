"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToTasksUpdate } from "@/lib/events";
import { fetchCachedJson } from "@/lib/panel-data-cache";

// STATS OVERVIEW

type StatsOverviewPanelProps = {
  habitsCompleted?: number;
  totalExp?: number;
  coinsEarned?: number;
  streak?: number;
};

export function StatsOverviewPanel({
  habitsCompleted = 0,
  totalExp = 0,
  coinsEarned = 0,
  streak = 0,
}: StatsOverviewPanelProps) {
  const stats = [
    { label: "Habits Completed", value: habitsCompleted, delta: "23% vs last week", dc: "#3aaa7a", up: true },
    { label: "Total EXP",        value: totalExp.toLocaleString(), delta: "18% vs last week", dc: "#3aaa7a", up: true },
    { label: "Coins Earned",     value: coinsEarned.toLocaleString(), delta: "15% vs last week", dc: "#f59e0b", up: true },
    { label: "Streak",           value: streak, delta: "2 days vs last week", dc: "#3aaa7a", up: true },
  ];

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
            <path d="M18 20V10 M12 20V4 M6 20v-6"/>
          </svg>
          <span>Stats Overview</span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>This Week</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 12px 14px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#111520", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: s.dc, marginTop: 3 }}>
              {s.up ? "▲" : "▼"} {s.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// RECENT ACHIEVEMENTS

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  rewardExp: number;
  unlockedAt: string | null;
  status: "locked" | "unlocked" | "claimed";
};

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Baru saja";
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

const RARITY_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  LEGENDARY: { bg: "rgba(234,179,8,0.2)",   border: "rgba(234,179,8,0.4)",   color: "#fde047" },
  EPIC:      { bg: "rgba(139,92,246,0.2)",   border: "rgba(139,92,246,0.4)",  color: "#a78bfa" },
  RARE:      { bg: "rgba(34,211,238,0.2)",   border: "rgba(34,211,238,0.4)",  color: "#22d3ee" },
  COMMON:    { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" },
};

const MOCK_ACH: Achievement[] = [
  { id: -1, name: "Discipline Streak", description: "Maintain a 7-day streak", icon: "shield", rarity: "EPIC", rewardExp: 100, unlockedAt: new Date(Date.now() - 7200000).toISOString(), status: "unlocked" },
];

export function RecentAchievementsPanel() {
  const [items, setItems] = useState<Achievement[]>(MOCK_ACH);

  const load = useCallback(async () => {
    try {
      const data = await fetchCachedJson<{ achievements: Achievement[] }>("/api/achievements");
      const recent = data.achievements
        .filter(a => a.status !== "locked" && a.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
        .slice(0, 2);
      if (recent.length > 0) setItems(recent);
    } catch { }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const u = subscribeToTasksUpdate(() => void load()); return u; }, [load]);

  const ICON_MAP: Record<string, string> = {
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    trophy: "M8 21h8 M12 17v4 M7 4H4.5a2.5 2.5 0 000 5H7 M17 4h2.5a2.5 2.5 0 010 5H17 M7 4h10v8a5 5 0 01-10 0V4z",
    crown: "M2 20h20 M5 20V10l7-7 7 7v10",
    streak: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    void: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    relic: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z",
    vault: "M5 12H3 M21 12h-2 M12 3V1 M12 23v-2 M12 17a5 5 0 100-10 5 5 0 000 10z",
    spark: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  };

  const getIconPath = (icon: string) => {
    const lower = icon.toLowerCase();
    for (const [key, path] of Object.entries(ICON_MAP)) {
      if (lower.includes(key)) return path;
    }
    return ICON_MAP.star!;
  };

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <path d="M8 21h8 M12 17v4 M7 4H4.5a2.5 2.5 0 000 5H7 M17 4h2.5a2.5 2.5 0 010 5H17 M7 4h10v8a5 5 0 01-10 0V4z"/>
          </svg>
          <span>Recent Achievements</span>
        </div>
        <button type="button"
          style={{ fontSize: 10, fontWeight: 600, color: "#22d3ee", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => { window.location.hash = "achievements"; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          View All
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 10px 14px" }}>
        {items.map((ach) => {
          const r = RARITY_STYLES[ach.rarity] ?? RARITY_STYLES.COMMON!;
          const iconPath = getIconPath(ach.icon);
          return (
            <div key={ach.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#111520", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                background: r.bg, border: `1px solid ${r.border}`,
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={iconPath}/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ach.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ach.description}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
                  {ach.unlockedAt ? `Unlocked ${timeAgo(ach.unlockedAt)}` : "Unlocked"}
                </div>
              </div>
              <div style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: r.color }}>+{ach.rewardExp} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
