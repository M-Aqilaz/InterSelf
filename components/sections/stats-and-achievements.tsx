"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToTasksUpdate } from "@/lib/events";

// ─── STATS OVERVIEW ───────────────────────────────────────────────

type StatsOverviewPanelProps = {
  habitsCompleted?: number;
  totalExp?: number;
  coinsEarned?: number;
  streak?: number;
};

export function StatsOverviewPanel({
  habitsCompleted = 16,
  totalExp = 1280,
  coinsEarned = 680,
  streak = 12,
}: StatsOverviewPanelProps) {
  const stats = [
    { label: "Habits Completed", value: habitsCompleted,           delta: "▲ 23% vs last week", dc: "#3aaa7a" },
    { label: "Total EXP",        value: totalExp.toLocaleString(), delta: "▲ 18% vs last week", dc: "#3aaa7a" },
    { label: "Coins Earned",     value: coinsEarned.toLocaleString(), delta: "▲ 15% vs last week", dc: "#f59e0b" },
    { label: "🔥 Streak",        value: streak,                    delta: "▲ 2 days vs last week", dc: "#3aaa7a" },
  ];

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <span>📊</span><span>Stats Overview</span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>This Week ▾</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 12px 14px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#111520", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: s.dc, marginTop: 3 }}>{s.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECENT ACHIEVEMENTS ──────────────────────────────────────────

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
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const RARITY: Record<string, { bg: string; border: string; color: string }> = {
  LEGENDARY: { bg: "rgba(234,179,8,0.2)",   border: "rgba(234,179,8,0.4)",   color: "#fde047" },
  EPIC:      { bg: "rgba(139,92,246,0.2)",   border: "rgba(139,92,246,0.4)",  color: "#a78bfa" },
  RARE:      { bg: "rgba(34,211,238,0.2)",   border: "rgba(34,211,238,0.4)",  color: "#22d3ee" },
  COMMON:    { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" },
};

const MOCK: Achievement[] = [
  { id: -1, name: "Discipline Streak", description: "Maintain a 7-day streak", icon: "🛡️", rarity: "EPIC", rewardExp: 100, unlockedAt: new Date(Date.now() - 7200000).toISOString(), status: "unlocked" },
];

export function RecentAchievementsPanel() {
  const [items, setItems] = useState<Achievement[]>(MOCK);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as { achievements: Achievement[] };
      const recent = data.achievements
        .filter(a => a.status !== "locked" && a.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
        .slice(0, 2);
      if (recent.length > 0) setItems(recent);
    } catch { }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const u = subscribeToTasksUpdate(() => void load()); return u; }, [load]);

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <span>🏅</span><span>Recent Achievements</span>
        </div>
        <button type="button"
          style={{ fontSize: 10, fontWeight: 600, color: "#22d3ee", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => { window.location.hash = "vault"; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          View All
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 10px 14px" }}>
        {items.map((ach) => {
          const r = RARITY[ach.rarity] ?? RARITY.COMMON;
          return (
            <div key={ach.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#111520", borderRadius: 12, padding: "10px 12px" }}>
              {/* Icon with rarity bg */}
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                background: r.bg, border: `1px solid ${r.border}`,
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {ach.icon}
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
