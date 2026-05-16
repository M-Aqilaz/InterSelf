"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { BarMeter } from "@/components/ui/meters";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Weekly Challenges</p>
          <h3 className="text-2xl font-black text-white">Limited-Time Arcs</h3>
        </div>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading weekly challenges...</p>
      ) : challenges.length ? (
        <ul className="mt-6 space-y-4">
          {challenges.map((challenge) => (
            <li key={challenge.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{challenge.title}</p>
                  <p className="text-xs text-white/60">{challenge.description}</p>
                </div>
                <div className="text-right text-xs text-white/60">
                  <p>
                    Reward: {challenge.rewardExp} EXP · {challenge.rewardCoins} coins
                    {challenge.rewardItemName ? ` · ${challenge.rewardItemName}` : ""}
                  </p>
                  <p>
                    {new Date(challenge.startDate).toLocaleDateString()} —
                    {new Date(challenge.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <BarMeter
                className="mt-4"
                label="Progress"
                value={
                  challenge.target === 0
                    ? 0
                    : Math.min(100, Math.round((challenge.progress / challenge.target) * 100))
                }
              />
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span>
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
                  <span>
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
