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
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  if (!status) return null;
  if (status.streak === 0 && !status.debuffActive && !status.shieldActive) return null;

  return (
    <AnimatePresence>
      {status.debuffActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10 text-sm font-black text-red-300">
            !
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-300">Streak putus, debuff aktif 24 jam</p>
            <p className="text-xs text-red-300/70">
              EXP dari task berkurang 20%. Selesaikan task hari ini untuk pulihkan streak.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-red-400/60">Streak sebelumnya</p>
            <p className="text-lg font-black text-red-300">{status.bestStreak} hari</p>
          </div>
        </motion.div>
      )}

      {status.shieldActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-purple-500/40 bg-purple-500/10 px-4 py-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-400/10 text-xs font-black text-purple-200">
            SH
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-purple-300">Streak Shield aktif</p>
            <p className="text-xs text-purple-300/70">
              Streak kamu terlindungi sampai{" "}
              {status.shieldExpiry
                ? new Date(status.shieldExpiry).toLocaleString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  })
                : "besok"}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-300">
            {status.streak} hari
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
