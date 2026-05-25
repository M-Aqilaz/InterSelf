"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";

type Challenge = {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  endDate: string;
  rewardExp: number;
  rewardCoins: number;
  rewardItemName?: string | null;
  claimable: boolean;
  claimedAt: string | null;
};

const BAR_COLORS = [
  "linear-gradient(90deg, #7c3aed, #8b5cf6)",
  "linear-gradient(90deg, #d97706, #fbbf24)",
  "linear-gradient(90deg, #0891b2, #22d3ee)",
];

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return days > 0 ? `Resets in ${days}d ${hrs}h ${mins}m` : `Resets in ${hrs}h ${mins}m`;
}

export function WeeklyChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetLabel, setResetLabel] = useState("");
  const [pending, start] = useTransition();
  const { push } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as { challenges: Challenge[] };
      if (Array.isArray(data.challenges)) {
        setChallenges(data.challenges.slice(0, 3));
      }
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const unsub = subscribeToTasksUpdate(() => void load());
    return unsub;
  }, [load]);

  // Reset label timer
  useEffect(() => {
    if (!challenges[0]) return;
    const update = () => setResetLabel(timeUntil(challenges[0]!.endDate));
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [challenges]);

  function claim(id: number) {
    start(async () => {
      const res = await fetch(`/api/challenges/${id}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { push({ title: data.error ?? "Failed", variant: "error" }); return; }
      push({ title: "Reward claimed!", variant: "success" });
      void load();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "#0c1018" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M8 21h8 M12 17v4 M7 4H4.5a2.5 2.5 0 000 5H7 M17 4h2.5a2.5 2.5 0 010 5H17 M7 4h10v8a5 5 0 01-10 0V4z"/></svg>
          <span>Weekly Challenge</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#22d3ee" }}>{resetLabel}</span>
      </div>

      {/* Challenges */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 14px 14px" }}>
        {loading ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "10px 0" }}>Loading...</div>
        ) : challenges.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "10px 0" }}>No active challenges</div>
        ) : challenges.map((ch, idx) => {
          const pct = ch.target > 0 ? Math.min(100, Math.round((ch.progress / ch.target) * 100)) : 0;
          const bar = BAR_COLORS[idx % BAR_COLORS.length]!;
          const isDone = ch.claimedAt !== null;
          return (
            <div key={ch.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{ch.title}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{ch.progress} / {ch.target}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: bar, borderRadius: 3, transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#a78bfa" }}>+{ch.rewardExp} XP</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>+{ch.rewardCoins} coins</span>
                {ch.rewardItemName && (
                  <span style={{ fontSize: 9, color: "#22d3ee" }}>{ch.rewardItemName}</span>
                )}
                {isDone ? (
                  <span style={{ marginLeft: "auto", background: "rgba(58,170,122,0.15)", color: "#3aaa7a", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>Claimed</span>
                ) : ch.claimable ? (
                  <button type="button" disabled={pending} onClick={() => claim(ch.id)}
                    style={{ marginLeft: "auto", background: "rgba(245,158,11,0.2)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
                    Claim
                  </button>
                ) : (
                  <span style={{ marginLeft: "auto", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "0 14px 14px" }}>
        <button type="button"
          style={{ width: "100%", background: "#111520", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "9px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
          onClick={() => { window.location.hash = "mission"; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          View All Challenges
        </button>
      </div>
    </div>
  );
}
