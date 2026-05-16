"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarMeter } from "@/components/ui/meters";
import { Badge } from "@/components/ui/badge";
import { useGameAudio } from "@/hooks/use-game-audio";

const rarityStyles: Record<string, string> = {
  LEGENDARY: "border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.35)]",
  EPIC: "border-purple-400/60 shadow-[0_0_25px_rgba(192,132,252,0.35)]",
  RARE: "border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.35)]",
  COMMON: "border-white/20",
};

const EQUIPMENT_SLOTS = ["Core Relic", "Augment", "Support"]; // fallback labels

const AVATAR_GALLERY = [
  {
    id: "eclipse",
    label: "Eclipse Sentinel",
    element: "void",
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "ember",
    label: "Ember Valkyrie",
    element: "fire",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "aether",
    label: "Aether Strider",
    element: "wind",
    image:
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=400&q=60",
  },
];

const AVATAR_STORAGE_KEY = "interself-avatar-id";
const DEFAULT_AVATAR_ID = AVATAR_GALLERY[0]?.id ?? "";

const getDeterministicAvatarId = (seed: string) => {
  if (!AVATAR_GALLERY.length) return "";
  const normalized = seed?.trim().toLowerCase() ?? "";
  if (!normalized) return DEFAULT_AVATAR_ID;
  const hash = Array.from(normalized).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  const index = Math.abs(hash) % AVATAR_GALLERY.length;
  return AVATAR_GALLERY[index]?.id ?? DEFAULT_AVATAR_ID;
};

const RANK_ORDER = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ASCENDANT"];

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
  const { play } = useGameAudio();
  const deterministicAvatarId = useMemo(() => getDeterministicAvatarId(username), [username]);
  const [avatarId, setAvatarId] = useState<string>(deterministicAvatarId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!stored || !AVATAR_GALLERY.some((avatar) => avatar.id === stored)) return;
    const frame = window.requestAnimationFrame(() => {
      setAvatarId(stored);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const activeAvatar = useMemo(() => AVATAR_GALLERY.find((avatar) => avatar.id === avatarId) ?? AVATAR_GALLERY[0], [avatarId]);

  const handleAvatarChange = (nextId: string) => {
    setAvatarId(nextId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AVATAR_STORAGE_KEY, nextId);
    }
    void play("nav", 120);
  };

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
              className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/30 shadow-lg"
              whileHover={{ scale: 1.04 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeAvatar?.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
              <p className="relative z-10 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">
                {activeAvatar?.element}
              </p>
            </motion.div>
            <Badge variant="cyber" className="absolute -bottom-3 left-1/2 -translate-x-1/2">
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

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0c1a] to-[#1c0f2a] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Hunter Avatars</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {AVATAR_GALLERY.map((avatar) => (
              <button
                key={avatar.id}
                className={`relative overflow-hidden rounded-2xl border px-3 py-2 text-left transition ${
                  avatar.id === avatarId ? "border-cyan-400/70" : "border-white/10"
                }`}
                onClick={() => handleAvatarChange(avatar.id)}
                type="button"
              >
                <span className="text-xs font-semibold text-white">{avatar.label}</span>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{avatar.element}</p>
              </button>
            ))}
          </div>
        </div>

        <RankRoadmap currentRank={rank} />
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

function RankRoadmap({ currentRank }: { currentRank: string }) {
  const currentIndex = RANK_ORDER.findIndex((value) => value === currentRank.toUpperCase());
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Rank Roadmap</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {RANK_ORDER.map((tier, index) => {
          const reached = currentIndex >= index;
          return (
            <motion.div
              key={tier}
              className={`flex-1 min-w-[120px] rounded-2xl border px-4 py-3 text-center ${
                reached ? "border-emerald-400/60 bg-emerald-400/10" : "border-white/10 bg-white/5"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Tier</p>
              <p className="text-lg font-black text-white">{tier}</p>
              {index === currentIndex + 1 && <p className="text-[11px] text-amber-200">Next Promotion</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
