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
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `Resets in ${days}d ${hours}h ${mins}m`;
  return `Resets in ${hours}h ${mins}m`;
}

const FALLBACK: Challenge[] = [
  { id: -1, title: "Complete 25 habits this week", description: "", progress: 18, target: 25, endDate: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000).toISOString(), rewardExp: 300, rewardCoins: 150, claimable: false, claimedAt: null },
  { id: -2, title: "Workout 4x this week", description: "", progress: 3, target: 4, endDate: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000).toISOString(), rewardExp: 200, rewardCoins: 50, claimable: false, claimedAt: null },
  { id: -3, title: "Study total 10 hours", description: "", progress: 7, target: 10, endDate: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000).toISOString(), rewardExp: 250, rewardCoins: 50, claimable: false, claimedAt: null },
];

export function WeeklyChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/challenges", { cache: "no-store" });
      if (!res.ok) throw new Error("fail");
      const data = await res.json() as { challenges: Challenge[] };
      setChallenges(data.challenges.slice(0, 3));
    } catch {
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadChallenges(); }, [loadChallenges]);
  useEffect(() => {
    const unsub = subscribeToTasksUpdate(() => void loadChallenges());
    return unsub;
  }, [loadChallenges]);

  function claim(id: number) {
    startTransition(async () => {
      const res = await fetch(`/api/challenges/${id}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { push({ title: data.error ?? "Failed", variant: "error" }); return; }
      push({ title: "Reward claimed!", variant: "success" });
      void loadChallenges();
    });
  }

  const display = challenges.length > 0 ? challenges : FALLBACK;
  const resetLabel = display[0] ? timeUntil(display[0].endDate) : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border" style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>🏆</span><span>Weekly Challenge</span>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "#22d3ee" }}>{resetLabel}</span>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        {display.map((ch, idx) => {
          const pct = ch.target > 0 ? Math.min(100, Math.round((ch.progress / ch.target) * 100)) : 0;
          const barColor = BAR_COLORS[idx % BAR_COLORS.length];
          const isDone = ch.claimedAt !== null;
          return (
            <div key={ch.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white">{ch.title}</span>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{ch.progress} / {ch.target}</span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold" style={{ color: "#a78bfa" }}>🎁 +{ch.rewardExp} XP</span>
                <span className="text-[9px] font-bold" style={{ color: "#f59e0b" }}>🪙+{ch.rewardCoins}</span>
                {isDone ? (
                  <span className="ml-auto rounded-full px-2 py-[2px] text-[9px] font-bold" style={{ background: "rgba(58,170,122,0.15)", color: "#3aaa7a" }}>Claimed ✓</span>
                ) : ch.claimable ? (
                  <button type="button" disabled={pending} onClick={() => claim(ch.id)} className="ml-auto rounded-full px-2 py-[2px] text-[9px] font-bold" style={{ background: "rgba(139,92,246,0.25)", color: "#c4b5fd" }}>Claim Reward</button>
                ) : (
                  <span className="ml-auto rounded-full border px-2 py-[2px] text-[9px] font-bold" style={{ background: "rgba(34,211,238,0.08)", borderColor: "rgba(34,211,238,0.2)", color: "#22d3ee" }}>In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-4">
        <button type="button" className="w-full rounded-xl border py-[9px] text-[11px] font-bold transition hover:border-white/20" style={{ background: "#111520", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
          onClick={() => { window.location.hash = "mission"; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          View All Challenges →
        </button>
      </div>
    </div>
  );
}
