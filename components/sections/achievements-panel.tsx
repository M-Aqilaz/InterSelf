"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";

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
  unlockedAt: string | null;
  claimedAt: string | null;
};

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/achievements", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load achievements");
      const data = (await res.json()) as { achievements: Achievement[] };
      setAchievements(data.achievements);
    } catch {
      push({ title: "Failed to load achievements", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void (async () => {
      await loadAchievements();
    })();
  }, [loadAchievements]);

  useEffect(() => {
    const unsubscribe = subscribeToTasksUpdate(() => {
      void loadAchievements();
    });
    return unsubscribe;
  }, [loadAchievements]);

  function rarityColor(rarity: string) {
    switch (rarity) {
      case "LEGENDARY":
        return "text-yellow-300";
      case "EPIC":
        return "text-purple-300";
      case "RARE":
        return "text-cyan-300";
      default:
        return "text-white/70";
    }
  }

  async function claimAchievement(id: number) {
    startTransition(async () => {
      const res = await fetch(`/api/achievements/${id}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        push({ title: data.error ?? "Unable to claim", variant: "error" });
        return;
      }
      push({
        title: "Achievement claimed",
        description: `+${data.reward.exp} EXP · ${data.reward.coins} coins`,
        variant: "success",
      });
      loadAchievements();
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Achievements</p>
          <h3 className="text-2xl font-black text-white">Codex</h3>
        </div>
        <Badge variant="void">{achievements.filter((a) => a.status === "claimed").length} claimed</Badge>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading achievements...</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {achievements.map((achievement) => (
            <li key={achievement.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {achievement.icon ? `${achievement.icon} ` : ""}
                    {achievement.name}
                  </p>
                  <p className="text-xs text-white/60">{achievement.description}</p>
                </div>
                <div className="text-right text-xs">
                  <p className={rarityColor(achievement.rarity)}>Rarity: {achievement.rarity}</p>
                  <p className="text-white/70">
                    Reward: {achievement.rewardExp} EXP · {achievement.rewardCoins} coins
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span className="capitalize">Status: {achievement.status}</span>
                {achievement.claimable && (
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => claimAchievement(achievement.id)}
                  >
                    Claim Reward
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
