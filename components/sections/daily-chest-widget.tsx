"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ChestReward = {
  day: number;
  exp: number;
  coins: number;
  label: string;
  rarity: "common" | "uncommon" | "rare" | "epic";
  bonus?: string;
};

type ChestState = {
  alreadyClaimed: boolean;
  currentStreak: number;
  nextReward: ChestReward | null;
};

const RARITY_STYLES = {
  common: { border: "border-white/20", label: "Biasa", color: "text-white/60" },
  uncommon: { border: "border-emerald-500/40", label: "Langka", color: "text-emerald-400" },
  rare: { border: "border-cyan-500/50", label: "Berharga", color: "text-cyan-400" },
  epic: { border: "border-purple-500/60", label: "Epik", color: "text-purple-300" },
};

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Epic"];

export function DailyChestWidget() {
  const [state, setState] = useState<ChestState | null>(null);
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [claimedReward, setClaimedReward] = useState<ChestReward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-chest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setState(data);
          if (data.alreadyClaimed) setOpened(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const claimChest = useCallback(async () => {
    if (opening || opened) return;
    setOpening(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const res = await fetch("/api/daily-chest", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setClaimedReward(data.reward);
      setOpened(true);
      setState((prev) =>
        prev ? { ...prev, alreadyClaimed: true, currentStreak: data.newStreak } : prev
      );
    }
    setOpening(false);
  }, [opening, opened]);

  if (loading || !state) return null;

  const reward = claimedReward ?? state.nextReward;
  const rarity = reward?.rarity ?? "common";
  const style = RARITY_STYLES[rarity];
  const currentDay = Math.min((state.currentStreak % 7) + 1, 7);

  return (
    <button
      type="button"
      className={`relative w-full overflow-hidden rounded-2xl border bg-black/40 p-4 text-left ${style.border} ${
        opened ? "cursor-default" : "transition-colors hover:bg-white/5"
      }`}
      onClick={!opened ? claimChest : undefined}
      disabled={opened}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Daily Chest
          </p>
          <p className={`text-sm font-bold ${style.color}`}>
            {opened ? "Sudah diklaim hari ini" : "Klik untuk buka"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40">Streak chest</p>
          <p className="text-lg font-black text-amber-400">{state.currentStreak} hari</p>
        </div>
      </div>

      <div className="mb-4 flex gap-1">
        {DAY_LABELS.map((label, index) => {
          const dayNum = index + 1;
          const isPast = dayNum < currentDay || (opened && dayNum === currentDay);
          const isToday = dayNum === currentDay && !opened;

          return (
            <div key={label} className="flex-1 text-center">
              <div
                className={`mb-1 h-1.5 rounded-full transition-all ${
                  isPast ? "bg-amber-400" : isToday ? "animate-pulse bg-amber-400/50" : "bg-white/10"
                }`}
              />
              <span
                className={`text-[9px] font-bold ${
                  isPast ? "text-amber-400" : isToday ? "text-white/70" : "text-white/25"
                } ${dayNum === 7 ? "text-purple-400" : ""}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className={`relative flex h-16 w-16 select-none items-center justify-center rounded-xl border-2 text-sm font-black tracking-wider ${style.border} ${
            opened ? "bg-white/5" : "bg-white/10"
          }`}
          animate={opening ? { rotate: [-3, 3, -3, 3, 0], scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          {opened ? "OK" : opening ? "..." : "BOX"}
          {!opened && !opening && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-amber-400/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="min-w-0 flex-1">
          {reward ? (
            <AnimatePresence>
              <motion.div
                initial={opened && claimedReward ? { opacity: 0, y: 8 } : { opacity: 1 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${style.color}`}>
                  {style.label} / Hari ke-{reward.day}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-cyan-400">+{reward.exp} EXP</span>
                  <span className="text-sm font-bold text-amber-400">+{reward.coins} coins</span>
                  {reward.bonus && (
                    <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-xs text-purple-300">
                      {reward.bonus}
                    </span>
                  )}
                </div>
                {!opened && <p className="mt-1 text-[10px] text-white/30">Reset besok jam 00:00</p>}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>
    </button>
  );
}
