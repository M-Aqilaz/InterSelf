"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";
import { useGameAudio } from "@/hooks/use-game-audio";
import { fetchCachedJson, getCachedJson, invalidateCachedJson } from "@/lib/panel-data-cache";

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  rewardExp: number;
  rewardCoins: number;
  status: "locked" | "unlocked" | "claimed";
  claimable: boolean;
  unlockedAt: string | Date | null;
  claimedAt: string | Date | null;
};

const RARITY_CONFIG: Record<string, {
  border: string; bg: string; badgeBg: string; badgeColor: string;
  iconBg: string; label: string; xpColor: string; glow: string;
}> = {
  LEGENDARY: { border: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.04)", badgeBg: "rgba(245,158,11,0.15)", badgeColor: "#fcd34d", iconBg: "rgba(245,158,11,0.18)", label: "Legendary", xpColor: "#fcd34d", glow: "rgba(245,158,11,0.08)" },
  EPIC:      { border: "rgba(139,92,246,0.4)", bg: "rgba(139,92,246,0.04)", badgeBg: "rgba(139,92,246,0.15)", badgeColor: "#c4b5fd", iconBg: "rgba(139,92,246,0.18)", label: "Epic",      xpColor: "#a78bfa", glow: "rgba(139,92,246,0.08)" },
  RARE:      { border: "rgba(34,211,238,0.35)", bg: "rgba(34,211,238,0.03)", badgeBg: "rgba(34,211,238,0.12)", badgeColor: "#22d3ee", iconBg: "rgba(34,211,238,0.15)", label: "Rare",      xpColor: "#22d3ee", glow: "rgba(34,211,238,0.06)" },
  COMMON:    { border: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.02)", badgeBg: "rgba(255,255,255,0.08)", badgeColor: "rgba(255,255,255,0.5)", iconBg: "rgba(255,255,255,0.07)", label: "Common", xpColor: "rgba(255,255,255,0.6)", glow: "transparent" },
};

function timeAgo(d: string | Date) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AchievementsPanel({ initialData }: { initialData?: { achievements: Achievement[] } }) {
  const cachedAchievements = getCachedJson<{ achievements: Achievement[] }>("/api/achievements") ?? initialData ?? null;
  const hasInitialAchievements = Boolean(cachedAchievements);
  const [achievements, setAchievements] = useState<Achievement[]>(cachedAchievements?.achievements ?? []);
  const [loading, setLoading] = useState(!cachedAchievements);
  const [pending, start] = useTransition();
  const { push } = useToast();
  const { play } = useGameAudio();
  const [filter, setFilter] = useState<"all" | "claimed" | "unlocked" | "locked">("all");

  const load = useCallback(async (force = false) => {
    if (!hasInitialAchievements && !getCachedJson<{ achievements: Achievement[] }>("/api/achievements")) setLoading(true);
    try {
      const data = await fetchCachedJson<{ achievements: Achievement[] }>("/api/achievements", { force });
      setAchievements(data.achievements);
    } catch {
      push({ title: "Failed to load achievements", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [hasInitialAchievements, push]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const unsub = subscribeToTasksUpdate(() => void load(true));
    return unsub;
  }, [load]);

  function claim(id: number) {
    start(async () => {
      const res = await fetch(`/api/achievements/${id}/claim`, { method: "POST" });
      if (res.ok) {
        invalidateCachedJson("/api/achievements");
        void play("unlock", 200);
        push({ title: "Achievement claimed! 🏆", variant: "success" });
        void load(true);
      } else {
        push({ title: "Failed to claim", variant: "error" });
      }
    });
  }

  const filtered = achievements.filter(a => filter === "all" ? true : a.status === filter);
  const claimedCount = achievements.filter(a => a.status === "claimed").length;
  const unlockedCount = achievements.filter(a => a.status === "unlocked").length;
  const totalCount = achievements.length;

  const FILTERS: Array<{ key: typeof filter; label: string }> = [
    { key: "all", label: "All" },
    { key: "unlocked", label: "Ready to Claim" },
    { key: "claimed", label: "Claimed" },
    { key: "locked", label: "Locked" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #0c1018 100%)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 16, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(34,211,238,0.6)", marginBottom: 4 }}>Codex</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>Achievements</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Your milestones and unlocked rewards</p>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ background: "rgba(58,170,122,0.12)", border: "1px solid rgba(58,170,122,0.25)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#3aaa7a" }}>{claimedCount}</div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(58,170,122,0.6)", textTransform: "uppercase" }}>Claimed</div>
            </div>
            {unlockedCount > 0 && (
              <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fcd34d" }}>{unlockedCount}</div>
                <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(245,158,11,0.6)", textTransform: "uppercase" }}>Ready</div>
              </div>
            )}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{totalCount}</div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Total</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            <span>Completion Progress</span>
            <span>{totalCount > 0 ? Math.round((claimedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totalCount > 0 ? (claimedCount / totalCount) * 100 : 0}%`, background: "linear-gradient(90deg, #22d3ee, #3aaa7a)", borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {FILTERS.map(f => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: "1px solid",
              borderColor: filter === f.key ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.08)",
              background: filter === f.key ? "rgba(34,211,238,0.12)" : "transparent",
              color: filter === f.key ? "#22d3ee" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}>
            {f.label}
            {f.key === "unlocked" && unlockedCount > 0 && (
              <span style={{ marginLeft: 6, background: "#f59e0b", color: "#000", borderRadius: 10, padding: "0 5px", fontSize: 9, fontWeight: 900 }}>{unlockedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading achievements...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(ach => {
            const r = RARITY_CONFIG[ach.rarity] ?? RARITY_CONFIG.COMMON;
            const isLocked = ach.status === "locked";
            const isClaimed = ach.status === "claimed";
            const isUnlocked = ach.status === "unlocked";

            return (
              <div key={ach.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: isLocked ? "rgba(255,255,255,0.02)" : r.bg,
                border: `1px solid ${isLocked ? "rgba(255,255,255,0.07)" : r.border}`,
                borderRadius: 14, padding: "14px 16px",
                opacity: isLocked ? 0.55 : 1,
                position: "relative", overflow: "hidden",
              }}>
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 0% 50%, ${r.glow} 0%, transparent 60%)`, pointerEvents: "none" }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 52, height: 52, flexShrink: 0, borderRadius: 14,
                  background: isLocked ? "rgba(255,255,255,0.05)" : r.iconBg,
                  border: `1px solid ${isLocked ? "rgba(255,255,255,0.08)" : r.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, filter: isLocked ? "grayscale(1)" : "none",
                  position: "relative",
                }}>
                  {isLocked ? "🔒" : ach.icon}
                  {isClaimed && (
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, background: "#3aaa7a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #0c1018" }}>✓</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: isLocked ? "rgba(255,255,255,0.4)" : "#fff" }}>{ach.name}</span>
                    <span style={{ background: r.badgeBg, color: r.badgeColor, borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {r.label}
                    </span>
                    {isClaimed && <span style={{ background: "rgba(58,170,122,0.15)", color: "#3aaa7a", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>Claimed ✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)", marginBottom: 4 }}>{ach.description}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: r.xpColor }}>+{ach.rewardExp} XP</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b" }}>🪙 {ach.rewardCoins}</span>
                    {ach.unlockedAt && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Unlocked {timeAgo(ach.unlockedAt)}</span>}
                  </div>
                </div>

                {/* Action */}
                <div style={{ flexShrink: 0 }}>
                  {isUnlocked && ach.claimable && (
                    <button type="button" disabled={pending} onClick={() => claim(ach.id)}
                      style={{
                        background: "linear-gradient(135deg, #d97706, #f59e0b)",
                        border: "none", borderRadius: 10, padding: "9px 18px",
                        fontSize: 12, fontWeight: 800, color: "#000", cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                      }}>
                      Claim 🎁
                    </button>
                  )}
                  {isClaimed && ach.unlockedAt && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20 }}>🏅</div>
                    </div>
                  )}
                  {isLocked && (
                    <div style={{ fontSize: 18, opacity: 0.3 }}>🔒</div>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>No achievements here</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
