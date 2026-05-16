"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const duelSample = {
  friend: "NovaBlade",
  playerExp: 1240,
  friendExp: 1180,
  playerTasks: 6,
  friendTasks: 5,
};

export function PvpPreviewPanel() {
  const playerLead = duelSample.playerExp - duelSample.friendExp;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#020612] via-[#0c0820] to-[#1d0d32] p-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-16 right-6 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl" />
      </div>
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Coming soon</p>
        <h3 className="text-2xl font-black">Productivity Duel Arena</h3>
        <p className="text-sm text-white/70">Challenge your friends in daily EXP races and mission streaks.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <PlayerCard title="You" exp={duelSample.playerExp} tasks={duelSample.playerTasks} highlight />
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">PvP Preview</p>
            <motion.div
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              VS
            </motion.div>
            <p className="text-xs text-white/60">Daily lead: {playerLead > 0 ? `+${playerLead}` : `${playerLead}`} EXP</p>
          </div>
          <PlayerCard title={duelSample.friend} exp={duelSample.friendExp} tasks={duelSample.friendTasks} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
          <p>Preview metrics refresh daily at 05:00.</p>
          <Button disabled className="opacity-70">
            Challenge Friend
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  title,
  exp,
  tasks,
  highlight = false,
}: {
  title: string;
  exp: number;
  tasks: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-2xl border px-4 py-5 ${highlight ? "border-cyan-400/60 bg-white/5 shadow-[0_0_30px_rgba(6,182,212,0.25)]" : "border-white/10 bg-white/5"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
      <p className="mt-1 text-2xl font-black">{exp} EXP</p>
      <p className="text-xs text-white/60">Tasks completed: {tasks}</p>
    </motion.div>
  );
}
