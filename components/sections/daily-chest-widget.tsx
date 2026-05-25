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
  common:   { border: "border-[var(--border-2)]", label: "Biasa", color: "var(--t2)" },
  uncommon: { border: "border-[rgba(58,170,122,0.4)]", label: "Langka", color: "var(--jade-light)" },
  rare:     { border: "border-[rgba(212,168,67,0.5)]", label: "Berharga", color: "var(--gold)" },
  epic:     { border: "border-[rgba(167,139,250,0.5)]", label: "EPIK", color: "#c4b5fd" },
};

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "EPIK"];

export function DailyChestWidget() {
  const [state, setState] = useState<ChestState | null>(null);
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [claimedReward, setClaimedReward] = useState<ChestReward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-chest")
      .then((res) => res.ok ? res.json() : null)
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

    await new Promise((r) => setTimeout(r, 800));

    const res = await fetch("/api/daily-chest", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setClaimedReward(data.reward);
      setOpened(true);
      setState((prev) => prev ? { ...prev, alreadyClaimed: true, currentStreak: data.newStreak } : prev);
    }
    setOpening(false);
  }, [opening, opened]);

  if (loading) return null;
  if (!state) return null;

  const reward = claimedReward ?? state.nextReward;
  const rarity = reward?.rarity ?? "common";
  const style = RARITY_STYLES[rarity];
  const currentDay = Math.min((state.currentStreak % 7) + 1, 7);

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-black/40 p-4 ${style.border} ${opened ? "" : "cursor-pointer hover:bg-white/5 transition-colors"}`}
      onClick={!opened ? claimChest : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Daily Chest</p>
          <p className="text-sm font-bold text-[var(--gold)]">
            {opened ? "Sudah diklaim hari ini" : "Klik untuk buka!"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40">Streak chest</p>
          <p className="text-lg text-[var(--gold)] font-[var(--font-mono)] font-black">{state.currentStreak} hari</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {DAY_LABELS.map((label, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay || (opened && dayNum === currentDay);
          const isToday = dayNum === currentDay && !opened;
          return (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-1 transition-all ${
                isPast ? "bg-[var(--gold)]" :
                isToday ? "bg-[rgba(212,168,67,0.5)] animate-pulse" :
                "bg-white/10"
              }`} />
              <span className={`text-[9px] font-bold ${
                isPast ? "text-[var(--gold)]" :
                isToday ? "text-white/70" :
                "text-white/25"
              } ${dayNum === 7 ? "text-[#c4b5fd]" : ""}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl select-none ${style.border} ${opened ? "bg-white/5" : "bg-white/10"}`}
          animate={opening ? { rotate: [-3, 3, -3, 3, 0], scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          {opened ? "✓" : opening ? "✨" : "🎁"}
          {!opened && !opening && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-[rgba(212,168,67,0.35)]"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="flex-1">
          {reward ? (
            <AnimatePresence>
              <motion.div
                initial={opened && claimedReward ? { opacity: 0, y: 8 } : { opacity: 1 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: style.color }}>
                  {style.label} · Hari ke-{reward.day}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[var(--jade-light)]">+{reward.exp} EXP</span>
                  <span className="text-sm font-bold text-[var(--gold)]">+{reward.coins} coins</span>
                  {reward.bonus && (
                    <span className="text-xs text-[#c4b5fd] bg-[rgba(167,139,250,0.15)] px-2 py-0.5 rounded-full border border-[rgba(167,139,250,0.3)]">
                      {reward.bonus}
                    </span>
                  )}
                </div>
                {!opened && (
                  <p className="text-[10px] text-white/30 mt-1">Reset besok jam 00:00</p>
                )}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>
      <div className="mt-4">
        <button
          className="btn-gold w-full justify-center"
          onClick={claimChest}
          disabled={opened || opening}
        >
          {opening ? "Membuka..." : opened ? "Sudah diklaim hari ini ✓" : "Buka Chest →"}
        </button>
      </div>
    </div>
  );
}
