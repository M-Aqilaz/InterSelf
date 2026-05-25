"use client";

import { useEffect, useState } from "react";
import { SageSprite, IroncladSprite, PhantomSprite, MerchantSprite, type SpriteProps } from "@/lib/character-sprites";
import type { ComponentType } from "react";

const SPRITES: Record<string, ComponentType<SpriteProps>> = {
  IRONCLAD: IroncladSprite, SAGE: SageSprite, PHANTOM: PhantomSprite, MERCHANT: MerchantSprite,
};

const ENERGY_REGEN_MS = 60 * 60 * 1000; // 1 hour

type Props = {
  coins: number;
  gems?: number;
  energy?: number;
  energyMax?: number;
  notifCount?: number;
  characterClass?: string | null;
};

export function DashboardTopbar({
  coins,
  gems: initialGems = 500,
  energy: initialEnergy = 5,
  energyMax = 5,
  notifCount = 3,
  characterClass,
}: Props) {
  const Sprite = SPRITES[characterClass ?? "SAGE"] ?? SageSprite;
  const [gems, setGems] = useState(initialGems);
  const [energy, setEnergy] = useState(initialEnergy);
  const [msUntilRegen, setMsUntilRegen] = useState<number | null>(null);
  const [regenLabel, setRegenLabel] = useState("");

  // Fetch real energy/gems from API
  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const res = await fetch("/api/energy", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json() as { energy: number; energyMax: number; gems: number; msUntilNextRegen: number | null };
          setEnergy(data.energy);
          setGems(data.gems);
          setMsUntilRegen(data.msUntilNextRegen);
        }
      } catch { }
    };
    void fetchEnergy();
    const interval = setInterval(() => void fetchEnergy(), 60000);
    return () => clearInterval(interval);
  }, []);

  // Countdown to next energy regen
  useEffect(() => {
    if (energy >= energyMax || msUntilRegen === null) { setRegenLabel(""); return; }
    let ms = msUntilRegen;
    const tick = () => {
      ms -= 1000;
      if (ms <= 0) { setRegenLabel(""); return; }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRegenLabel(`+1 in ${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [energy, energyMax, msUntilRegen]);

  const pillStyle = {
    display: "flex", alignItems: "center", gap: 6,
    background: "#111520", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, padding: "5px 12px",
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#0a0e17", borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "0 20px", width: "100%",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: 16, height: 16 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>LifeQuest</div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.2em" }}>RPG Your Life</div>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Coins */}
        <div style={pillStyle}>
          <span style={{ fontSize: 14 }}>🪙</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{coins.toLocaleString()}</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.38)" }}>Coins</div>
          </div>
        </div>

        {/* Gems */}
        <div style={{ ...pillStyle, borderColor: "rgba(34,211,238,0.2)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <path d="M6 3h12l4 6-10 13L2 9z M2 9h20 M6 3l4 6 M18 3l-4 6"/>
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#22d3ee" }}>{gems.toLocaleString()}</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(34,211,238,0.5)" }}>Gems</div>
          </div>
        </div>

        {/* Energy */}
        <div style={{ ...pillStyle, borderColor: energy > 0 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)", cursor: "help", position: "relative" }}
          title={energy < energyMax ? `Regen: ${regenLabel || "calculating..."}` : "Full energy!"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={energy > 0 ? "#f59e0b" : "#ef4444"} stroke="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: energy > 0 ? "#f59e0b" : "#ef4444" }}>
              {energy}/{energyMax}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(245,158,11,0.5)" }}>
              {regenLabel || "Energy"}
            </div>
          </div>
          {/* Energy dots */}
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: energyMax }).map((_, i) => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i < energy ? "#f59e0b" : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }} />
            ))}
          </div>
        </div>

        <button type="button" style={{ width: 30, height: 30, background: "#111520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>

      {/* Right: notif + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" style={{ position: "relative", width: 32, height: 32, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifCount > 0 && (
            <span style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, background: "#e05a6a", borderRadius: "50%", fontSize: 9, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {notifCount}
            </span>
          )}
        </button>
        <div style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid rgba(139,92,246,0.5)", background: "#1e1040", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sprite style={{ width: 30, height: 38, transform: "translateY(4px)" }} />
        </div>
      </div>
    </header>
  );
}
