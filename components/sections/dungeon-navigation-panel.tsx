"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGameAudio } from "@/hooks/use-game-audio";

const dungeons = [
  {
    id: "ashen-citadel",
    name: "Ashen Citadel",
    difficulty: "A",
    biome: "Volcanic",
    status: "Available",
    description: "Purge the ember tyrant's watchtower",
  },
  {
    id: "glacier-veil",
    name: "Glacier Veil",
    difficulty: "B",
    biome: "Frost",
    status: "Locked",
    description: "Scout the frozen ley-lines",
  },
  {
    id: "luminous-depths",
    name: "Luminous Depths",
    difficulty: "S",
    biome: "Abyss",
    status: "Coming Soon",
    description: "Descend into the astral trench",
  },
];

export function DungeonNavigationPanel() {
  const { play } = useGameAudio();
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#04060f] via-[#06021a] to-[#130823] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=60')", backgroundSize: "cover" }} />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Exploration</p>
            <h3 className="text-2xl font-black">Dungeon Atlas</h3>
          </div>
          <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={() => void play("nav", 160)}>
            Enter Portal
          </Button>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">World Map</p>
            <div className="mt-4 h-56 rounded-2xl border border-white/5 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60')] bg-cover bg-center">
              <div className="flex h-full items-center justify-center backdrop-blur-[1px]">
                <motion.div
                  className="rounded-full border border-cyan-400/60 px-6 py-2 text-sm font-semibold"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  Sanctum Route Locked
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {dungeons.map((dungeon) => (
              <motion.div
                key={dungeon.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="text-[11px] uppercase tracking-[0.3em]">{dungeon.biome}</span>
                  <span className="font-semibold text-white">{dungeon.difficulty} Rank</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-semibold">{dungeon.name}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase ${
                      dungeon.status === "Available"
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {dungeon.status}
                  </span>
                </div>
                <p className="text-sm text-white/60">{dungeon.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
