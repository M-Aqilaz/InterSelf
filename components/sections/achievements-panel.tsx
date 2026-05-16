"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";
import { motion, AnimatePresence } from "framer-motion";
import { useGameAudio } from "@/hooks/use-game-audio";

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
  const [recentUnlock, setRecentUnlock] = useState<number | null>(null);
  const { play } = useGameAudio();

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/achievements", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load achievements");
      const data = (await res.json()) as { achievements: Achievement[] };
      setAchievements((prev) => {
        const previouslyUnlocked = new Set(prev.filter((entry) => entry.status !== "locked").map((entry) => entry.id));
        const firstFresh = data.achievements.find((entry) => entry.status === "unlocked" && !previouslyUnlocked.has(entry.id));
        if (firstFresh) {
          setRecentUnlock(firstFresh.id);
          void play("unlock", 200);
        }
        return data.achievements;
      });
    } catch {
      push({ title: "Failed to load achievements", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push, play]);

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
      void play("equip", 180);
      loadAchievements();
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#05040a] to-[#140d1e] p-6">
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
          {achievements.map((achievement) => {
            const isHighlighted = recentUnlock === achievement.id;
            return (
              <motion.li
                key={achievement.id}
                className={`relative overflow-hidden rounded-2xl border p-4 ${
                  achievement.status === "claimed"
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : "border-white/10 bg-white/5"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400/10 via-transparent to-amber-400/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2 }}
                      onAnimationComplete={() => setRecentUnlock(null)}
                    />
                  )}
                </AnimatePresence>
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
                    <Button size="sm" disabled={pending} onClick={() => claimAchievement(achievement.id)}>
                      Claim Reward
                    </Button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
