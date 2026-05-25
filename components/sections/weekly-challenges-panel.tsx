"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";

type Challenge = { id: number; title: string; progress: number; target: number; endDate: string; rewardExp: number; rewardCoins: number; claimable: boolean; claimedAt: string | null };

const BARS = ["linear-gradient(90deg,#7c3aed,#8b5cf6)","linear-gradient(90deg,#d97706,#fbbf24)","linear-gradient(90deg,#0891b2,#22d3ee)"];

function timeUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff/86400000), hrs = Math.floor((diff%86400000)/3600000), mins = Math.floor((diff%3600000)/60000);
  return days > 0 ? `Resets in ${days}d ${hrs}h ${mins}m` : `Resets in ${hrs}h ${mins}m`;
}

const END = new Date(Date.now() + 3.5*86400000).toISOString();
const MOCK: Challenge[] = [
  { id:-1, title:"Complete 25 habits this week", progress:18, target:25, endDate:END, rewardExp:300, rewardCoins:150, claimable:false, claimedAt:null },
  { id:-2, title:"Workout 4x this week",          progress:3,  target:4,  endDate:END, rewardExp:200, rewardCoins:50,  claimable:false, claimedAt:null },
  { id:-3, title:"Study total 10 hours",           progress:7,  target:10, endDate:END, rewardExp:250, rewardCoins:50,  claimable:false, claimedAt:null },
];

function normalize(raw: Challenge[]): Challenge[] {
  if (!raw.length) return MOCK;
  return MOCK.map((m, i) => {
    const r = raw[i];
    if (!r) return m;
    return { ...m, id: r.id, progress: r.progress, target: r.target, endDate: r.endDate ?? m.endDate, rewardExp: r.rewardExp ?? m.rewardExp, rewardCoins: r.rewardCoins ?? m.rewardCoins, claimable: r.claimable, claimedAt: r.claimedAt };
  });
}

export function WeeklyChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK);
  const [pending, start] = useTransition();
  const [resetLabel, setResetLabel] = useState("");
  const { push } = useToast();

  useEffect(() => {
    setResetLabel(challenges[0] ? timeUntil(challenges[0].endDate) : "");
    const interval = setInterval(() => {
      setResetLabel(challenges[0] ? timeUntil(challenges[0].endDate) : "");
    }, 60000);
    return () => clearInterval(interval);
  }, [challenges]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as { challenges: Challenge[] };
      setChallenges(normalize(data.challenges));
    } catch { }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const u = subscribeToTasksUpdate(() => void load()); return u; }, [load]);

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
          <span>🏆</span><span>Weekly Challenge</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#22d3ee" }}>{resetLabel}</span>
      </div>

      {/* Challenges */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 14px 14px" }}>
        {challenges.map((ch, idx) => {
          const pct = ch.target > 0 ? Math.min(100, Math.round((ch.progress / ch.target) * 100)) : 0;
          const bar = BARS[idx % BARS.length]!;
          const done = ch.claimedAt !== null;
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
                <span style={{ fontSize: 9, fontWeight: 700, color: "#a78bfa" }}>🎁 +{ch.rewardExp} XP</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>🪙+{ch.rewardCoins}</span>
                {done ? (
                  <span style={{ marginLeft: "auto", background: "rgba(58,170,122,0.15)", color: "#3aaa7a", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>Claimed ✓</span>
                ) : ch.claimable ? (
                  <button type="button" disabled={pending} onClick={() => claim(ch.id)}
                    style={{ marginLeft: "auto", background: "rgba(139,92,246,0.25)", color: "#c4b5fd", border: "none", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
                    Claim Reward
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
          View All Challenges →
        </button>
      </div>
    </div>
  );
}

