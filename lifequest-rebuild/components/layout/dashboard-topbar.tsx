"use client";

import { useRouter } from "next/navigation";
import { SageSprite } from "@/lib/character-sprites";

type DashboardTopbarProps = {
  coins: number;
  gems?: number;
  energy?: number;
  energyMax?: number;
  notifCount?: number;
  characterClass?: string | null;
};

export function DashboardTopbar({
  coins,
  gems = 1280,
  energy = 5,
  energyMax = 5,
  notifCount = 3,
  characterClass,
}: DashboardTopbarProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b px-5"
      style={{
        background: "#0a0e17",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* LEFT: Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-4 w-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-black tracking-wider text-white">LifeQuest</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
            RPG Your Life
          </div>
        </div>
      </div>

      {/* CENTER: Stat Pills */}
      <div className="flex items-center gap-2">
        {/* Coins */}
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-[6px]"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <span className="text-sm">🪙</span>
          <div>
            <div className="text-xs font-bold text-white">{coins.toLocaleString()}</div>
            <div className="font-mono text-[9px] text-white/40">Coins</div>
          </div>
        </div>
        {/* Gems */}
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-[6px]"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <span className="text-sm">💎</span>
          <div>
            <div className="text-xs font-bold text-white">{gems.toLocaleString()}</div>
            <div className="font-mono text-[9px] text-white/40">Gems</div>
          </div>
        </div>
        {/* Energy */}
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-[6px]"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <span className="text-sm">⚡</span>
          <div>
            <div className="text-xs font-bold text-white">
              {energy}/{energyMax}
            </div>
            <div className="font-mono text-[9px] text-white/40">Energy</div>
          </div>
        </div>
        {/* Plus button */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl border text-sm text-white/50 transition hover:text-white"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.08)" }}
        >
          +
        </button>
      </div>

      {/* RIGHT: Notif + Avatar */}
      <div className="flex items-center gap-3">
        <button type="button" className="relative flex h-8 w-8 items-center justify-center">
          <span className="text-lg text-white/60">🔔</span>
          {notifCount > 0 && (
            <span
              className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
              style={{ background: "#e05a6a" }}
            >
              {notifCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full border"
          style={{ borderColor: "rgba(139,92,246,0.5)", background: "#1e1040" }}
          onClick={() => router.push("/dashboard#status")}
        >
          <SageSprite className="h-10 w-8 translate-y-1" />
        </button>
      </div>
    </header>
  );
}
