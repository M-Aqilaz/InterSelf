"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type StreakStatus = {
  streak: number;
  bestStreak: number;
  shieldActive: boolean;
  shieldExpiry: string | null;
  streakAtRisk: boolean;
  debuffActive: boolean;
};

export function StreakStatusBar() {
  const [status, setStatus] = useState<StreakStatus | null>(null);

  useEffect(() => {
    fetch("/api/streak/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  if (!status) return null;
  if (status.streak === 0 && !status.debuffActive) return null;

  return (
    <AnimatePresence>
      {status.debuffActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">Streak putus! Debuff aktif 24 jam</p>
            <p className="text-xs text-red-300/70">
              EXP dari task berkurang 20% · Selesaikan task hari ini untuk pulihkan streak
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-red-400/60">Streak sebelumnya</p>
            <p className="text-lg font-black text-red-400">{status.bestStreak} hari</p>
          </div>
        </motion.div>
      )}

      {status.shieldActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl">🛡️</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-purple-300">Streak Shield aktif</p>
            <p className="text-xs text-purple-300/70">
              Streak kamu terlindungi sampai{" "}
              {status.shieldExpiry
                ? new Date(status.shieldExpiry).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })
                : "besok"}
            </p>
          </div>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-lg">
            {status.streak} hari
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
