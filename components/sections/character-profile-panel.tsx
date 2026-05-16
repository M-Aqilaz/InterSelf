"use client";

import { motion } from "framer-motion";
import { BarMeter } from "@/components/ui/meters";
import { Badge } from "@/components/ui/badge";

const rarityStyles: Record<string, string> = {
  LEGENDARY: "border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.35)]",
  EPIC: "border-purple-400/60 shadow-[0_0_25px_rgba(192,132,252,0.35)]",
  RARE: "border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.35)]",
  COMMON: "border-white/20",
};

const EQUIPMENT_SLOTS = ["Core Relic", "Augment", "Support"]; // fallback labels

type EquippedItem = {
  id: number;
  name: string;
  rarity: string;
  description: string;
};

type EquipmentSlot = {
  slot: string;
  item?: EquippedItem | null;
};

type CharacterProfilePanelProps = {
  username: string;
  title: string;
  rank: string;
  level: number;
  expIntoLevel: number;
  expForNextLevel: number;
  coins: number;
  streak: number;
  bestStreak: number;
  powerScore: number;
  equippedSlots: EquipmentSlot[];
  stats: { type: string; value: number }[];
};

export function CharacterProfilePanel(props: CharacterProfilePanelProps) {
  const {
    username,
    title,
    rank,
    level,
    expIntoLevel,
    expForNextLevel,
    coins,
    streak,
    bestStreak,
    powerScore,
    equippedSlots,
    stats,
  } = props;

  const progressPercent = expForNextLevel > 0 ? Math.min(100, Math.round((expIntoLevel / expForNextLevel) * 100)) : 0;
  const initials = username ? username.slice(0, 2).toUpperCase() : "IN";

  const resolvedSlots: EquipmentSlot[] = EQUIPMENT_SLOTS.map((slot, index) => equippedSlots[index] ?? { slot });

  const topStats = [...stats]
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 via-[#12021f] to-[#06021f] p-6 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <motion.div
              className="grid h-20 w-20 place-items-center rounded-2xl border border-white/20 bg-white/10 text-lg font-black"
              whileHover={{ scale: 1.05 }}
            >
              {initials}
            </motion.div>
            <Badge variant="cyber" className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              {rank}
            </Badge>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Hunter Title</p>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-white/70">{username}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Power</p>
            <p className="text-3xl font-black text-cyan-300">{powerScore.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between text-sm text-white/60">
            <p>Level {level}</p>
            <p>
              {expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()} EXP
            </p>
          </div>
          <BarMeter className="mt-2" value={progressPercent} label="EXP" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatChip label="Coins" value={`${coins.toLocaleString()}◎`} />
            <StatChip label="Streak" value={`${streak}d`} />
            <StatChip label="Best Streak" value={`${bestStreak}d`} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Equipped Relics</p>
            <div className="mt-3 grid gap-3">
              {resolvedSlots.map((slot, index) => {
                const rarity = slot.item?.rarity ?? "COMMON";
                return (
                  <motion.div
                    key={`${slot.slot}-${index}`}
                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${rarityStyles[rarity] ?? rarityStyles.COMMON}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {slot.item ? slot.item.name : `Empty ${slot.slot}`}
                      </p>
                      <p className="text-xs text-white/60">
                        {slot.item ? slot.item.description : "Slot available"}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase text-white/60">{slot.item ? slot.item.rarity : "Open"}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Stat Spread</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {topStats.map((stat) => (
                <motion.div
                  key={stat.type}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.type}</p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
