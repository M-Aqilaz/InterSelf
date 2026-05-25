"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProkrastinasiAbyssalSprite } from "@/lib/boss-sprites";
import type { BossBattleState } from "@/types/boss";

type BossBattlePreviewProps = {
  productivityCompletion?: number;
};

export function BossBattlePreview({ productivityCompletion = 0 }: BossBattlePreviewProps) {
  const router = useRouter();
  const [state, setState] = useState<BossBattleState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBoss = useCallback(async () => {
    try {
      const res = await fetch("/api/boss/state", { cache: "no-store" });
      if (!res.ok) throw new Error("no boss");
      const data = await res.json() as BossBattleState;
      setState(data);
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBoss();
  }, [loadBoss]);

  // Fallback display values
  const bossName = state?.boss?.name ?? "Procrastination Demon";
  const bossLevel = 25; // Fixed fallback since level doesn't exist on Boss type
  const currentHp = state?.progress?.currentHp ?? 7450;
  const maxHp = state?.boss?.maxHp ?? 10000;
  const hpPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 74;
  const damageDealt = 2550; // Fixed fallback since totalDamage doesn't exist on UserBossProgress

  const navigateToBattle = () => {
    window.location.hash = "battle";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border"
      style={{
        background: "linear-gradient(160deg, #1a0610 0%, #0e0a14 55%, #080b15 100%)",
        borderColor: "rgba(239,68,68,0.15)",
      }}
    >
      {/* Red glow overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.1) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>⚔️</span>
          <span>Boss Battle</span>
        </div>
        <button type="button" className="text-sm text-white/30 hover:text-white/60">?</button>
      </div>

      {/* Boss sprite */}
      <div className="relative flex justify-center py-2">
        <div
          className="relative flex h-[130px] w-full items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at 50% 60%, rgba(220,38,38,0.08) 0%, transparent 65%)",
          }}
        >
          <ProkrastinasiAbyssalSprite className="relative z-10 h-[120px] w-[140px]" />
        </div>
      </div>

      {/* Boss name */}
      <div className="relative px-4 pb-2 text-center">
        <div className="text-base font-black" style={{ color: "#f87171" }}>{bossName}</div>
        <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          Level {bossLevel} Boss
        </div>
      </div>

      {/* HP bar */}
      <div className="relative px-4 pb-3">
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Boss HP</span>
          <span className="font-bold" style={{ color: "#f87171" }}>
            {currentHp.toLocaleString()} / {maxHp.toLocaleString()}
          </span>
          <span className="font-black" style={{ color: "#f87171" }}>{hpPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${hpPercent}%`,
              background: "linear-gradient(90deg, #dc2626, #ef4444)",
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="relative grid grid-cols-2 gap-2 px-4 pb-3">
        <div
          className="rounded-xl border p-3"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            ⚡ Damage Dealt
          </div>
          <div className="text-sm font-bold text-white">{damageDealt.toLocaleString()}</div>
        </div>
        <div
          className="rounded-xl border p-3"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>Rewards</div>
          <div className="flex gap-2 font-bold">
            <span className="text-[11px]" style={{ color: "#a78bfa" }}>+500 XP</span>
            <span className="text-[11px]" style={{ color: "#f59e0b" }}>🪙+200</span>
          </div>
        </div>
      </div>

      {/* View Battle button */}
      <div className="relative px-4 pb-4">
        <button
          type="button"
          onClick={navigateToBattle}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-[10px] text-xs font-black text-white transition hover:opacity-90 active:scale-[0.98]"
          style={{ background: "#dc2626" }}
        >
          <span>⚔️</span>
          View Battle
        </button>
      </div>
    </div>
  );
}
