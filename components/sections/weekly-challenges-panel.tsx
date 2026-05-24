"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";

type Challenge = {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  startDate: string;
  endDate: string;
  rewardExp: number;
  rewardCoins: number;
  rewardItemName?: string | null;
  claimable: boolean;
  claimedAt: string | null;
};

export function WeeklyChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/challenges", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load challenges");
      const data = (await res.json()) as { challenges: Challenge[] };
      setChallenges(data.challenges);
    } catch {
      push({ title: "Failed to load weekly challenges", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void (async () => {
      await loadChallenges();
    })();
  }, [loadChallenges]);

  useEffect(() => {
    const unsubscribe = subscribeToTasksUpdate(() => {
      void loadChallenges();
    });
    return unsubscribe;
  }, [loadChallenges]);

  function claim(challengeId: number) {
    startTransition(async () => {
      const res = await fetch(`/api/challenges/${challengeId}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        push({ title: data.error ?? "Unable to claim", variant: "error" });
        return;
      }
      push({
        title: "Challenge reward claimed",
        description:
          `+${data.reward.exp} EXP · ${data.reward.coins} coins` +
          (data.reward.item ? ` · ${data.reward.item}` : ""),
        variant: "success",
      });
      loadChallenges();
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Weekly Challenges</p>
          <h3 className="text-xl font-black text-white sm:text-2xl">Limited-Time Arcs</h3>
        </div>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading weekly challenges...</p>
      ) : challenges.length ? (
        <ul className="mt-6 space-y-4">
          {challenges.map((challenge) => (
            <li key={challenge.id} className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{challenge.title}</p>
                  <p className="mt-1 text-sm text-white/65">{challenge.description}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/70 sm:text-right">
                  <p className="font-medium text-white/80">
                    Reward: {challenge.rewardExp} EXP · {challenge.rewardCoins} coins
                    {challenge.rewardItemName ? ` · ${challenge.rewardItemName}` : ""}
                  </p>
                  <p className="mt-1">
                    {new Date(challenge.startDate).toLocaleDateString()} —
                    {new Date(challenge.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-white/55">
                  <span>Progress</span>
                  <span>
                    {challenge.target === 0
                      ? 0
                      : Math.min(100, Math.round((challenge.progress / challenge.target) * 100))}
                    %
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${challenge.target === 0
                        ? 0
                        : Math.min(100, Math.round((challenge.progress / challenge.target) * 100))}%`,
                      background:
                        (challenge.target === 0
                          ? 0
                          : Math.min(100, Math.round((challenge.progress / challenge.target) * 100))) >= 60
                          ? "linear-gradient(90deg, var(--jade-dim), var(--jade-light))"
                          : "linear-gradient(90deg, var(--gold-dim), var(--gold))",
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/65">
                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
                  {challenge.progress}/{challenge.target} completions
                </span>
                {challenge.claimable ? (
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => claim(challenge.id)}
                  >
                    Claim Reward
                  </Button>
                ) : (
                  <span className="text-white/55">
                    {challenge.claimedAt
                      ? `Claimed ${new Date(challenge.claimedAt).toLocaleDateString()}`
                      : "Keep pushing"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-white/60">No weekly challenges available.</p>
      )}
    </div>
  );
}
