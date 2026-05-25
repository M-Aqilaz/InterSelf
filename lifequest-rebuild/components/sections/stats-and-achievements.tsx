"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToTasksUpdate } from "@/lib/events";

// ─── STATS OVERVIEW ───────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
};

function StatCard({ label, value, delta, deltaColor = "#3aaa7a" }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "#111520" }}
    >
      <div className="mb-1 text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
      <div className="text-xl font-black text-white">{value}</div>
      {delta && (
        <div className="mt-[2px] text-[9px] font-semibold" style={{ color: deltaColor }}>
          {delta}
        </div>
      )}
    </div>
  );
}

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
  const [period, setPeriod] = useState("This Week");

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>📊</span>
          <span>Stats Overview</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] transition hover:text-white"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onClick={() => setPeriod(period === "This Week" ? "This Month" : "This Week")}
        >
          {period} ▾
        </button>
      </div>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <StatCard
          label="Habits Completed"
          value={habitsCompleted}
          delta="▲ 23% vs last week"
        />
        <StatCard
          label="Total EXP"
          value={totalExp.toLocaleString()}
          delta="▲ 18% vs last week"
        />
        <StatCard
          label="Coins Earned"
          value={coinsEarned.toLocaleString()}
          delta="▲ 15% vs last week"
          deltaColor="#f59e0b"
        />
        <StatCard
          label="🔥 Streak"
          value={streak}
          delta="▲ 2 days vs last week"
        />
      </div>
    </div>
  );
}

// ─── RECENT ACHIEVEMENTS ───────────────────────────────────────────

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  rewardExp: number;
  unlockedAt: string | null;
  claimedAt: string | null;
  status: "locked" | "unlocked" | "claimed";
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const RARITY_BG: Record<string, string> = {
  LEGENDARY: "rgba(234,179,8,0.2)",
  EPIC: "rgba(139,92,246,0.2)",
  RARE: "rgba(34,211,238,0.2)",
  COMMON: "rgba(255,255,255,0.08)",
};

const RARITY_BORDER: Record<string, string> = {
  LEGENDARY: "rgba(234,179,8,0.35)",
  EPIC: "rgba(139,92,246,0.35)",
  RARE: "rgba(34,211,238,0.35)",
  COMMON: "rgba(255,255,255,0.12)",
};

const RARITY_XP_COLOR: Record<string, string> = {
  LEGENDARY: "#fde047",
  EPIC: "#a78bfa",
  RARE: "#22d3ee",
  COMMON: "rgba(255,255,255,0.6)",
};

export function RecentAchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json() as { achievements: Achievement[] };
      // Only show recently unlocked (last 3, sorted by unlockedAt)
      const recent = data.achievements
        .filter((a) => a.status !== "locked" && a.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
        .slice(0, 2);
      setAchievements(recent);
    } catch {
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAchievements();
  }, [loadAchievements]);

  useEffect(() => {
    const unsub = subscribeToTasksUpdate(() => void loadAchievements());
    return unsub;
  }, [loadAchievements]);

  // Fallback mock achievement
  const displayAchievements: Achievement[] =
    achievements.length > 0
      ? achievements
      : [
          {
            id: -1,
            name: "Discipline Streak",
            description: "Maintain a 7-day streak",
            icon: "🛡️",
            rarity: "EPIC",
            rewardExp: 100,
            unlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            claimedAt: null,
            status: "unlocked",
          },
        ];

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>🏅</span>
          <span>Recent Achievements</span>
        </div>
        <button
          type="button"
          className="text-[10px] font-semibold transition hover:opacity-80"
          style={{ color: "#22d3ee" }}
          onClick={() => {
            window.location.hash = "vault";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          View All
        </button>
      </div>

      {/* Achievement list */}
      <div className="flex flex-col gap-1 px-3 pb-4">
        {displayAchievements.map((ach) => (
          <div
            key={ach.id}
            className="flex items-center gap-3 rounded-xl px-3 py-3"
            style={{ background: "#111520" }}
          >
            {/* Icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg"
              style={{
                background: RARITY_BG[ach.rarity] ?? RARITY_BG.COMMON,
                borderColor: RARITY_BORDER[ach.rarity] ?? RARITY_BORDER.COMMON,
              }}
            >
              {ach.icon}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-bold text-white">{ach.name}</div>
              <div className="truncate text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {ach.description}
              </div>
              <div className="mt-[2px] text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {ach.unlockedAt ? `Unlocked ${timeAgo(ach.unlockedAt)}` : "Unlocked"}
              </div>
            </div>

            {/* XP reward */}
            <div
              className="shrink-0 text-[11px] font-bold"
              style={{ color: RARITY_XP_COLOR[ach.rarity] ?? "#a78bfa" }}
            >
              +{ach.rewardExp} XP
            </div>
          </div>
        ))}

        {loading && (
          <div className="py-3 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
