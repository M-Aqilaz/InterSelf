"use client";

import { useEffect, useRef } from "react";

type BossState = {
  currentHp: number;
  maxHp: number;
  bossName: string;
  status: string;
};

export function useBossTabTitle() {
  const originalTitle = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    originalTitle.current = document.title;

    const checkBoss = async () => {
      try {
        const res = await fetch("/api/boss/state");
        if (!res.ok) return;
        const data = (await res.json()) as BossState | null;
        if (!data || data.status !== "ACTIVE") {
          document.title = originalTitle.current;
          return;
        }

        const hpPercent = Math.round((data.currentHp / data.maxHp) * 100);

        if (hpPercent <= 10) {
          // Alternating alert untuk HP sangat kritis
          const isAlt = Math.floor(Date.now() / 2000) % 2 === 0;
          document.title = isAlt
            ? `⚔️ BOSS ${hpPercent}% HP — SERANG SEKARANG!`
            : `💀 ${data.bossName} hampir mati!`;
        } else if (hpPercent <= 25) {
          document.title = `⚔️ Boss ${hpPercent}% HP · ${originalTitle.current}`;
        } else if (hpPercent <= 50) {
          document.title = `🗡️ Boss ${hpPercent}% HP · ${originalTitle.current}`;
        } else {
          document.title = originalTitle.current;
        }
      } catch {
        // ignore
      }
    };

    // Check setiap 30 detik
    checkBoss();
    intervalRef.current = setInterval(checkBoss, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.title = originalTitle.current;
    };
  }, []);
}
