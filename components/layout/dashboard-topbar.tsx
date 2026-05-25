"use client";

import { SageSprite, IroncladSprite, PhantomSprite, MerchantSprite, type SpriteProps } from "@/lib/character-sprites";
import type { ComponentType } from "react";

const SPRITES: Record<string, ComponentType<SpriteProps>> = {
  IRONCLAD: IroncladSprite, SAGE: SageSprite, PHANTOM: PhantomSprite, MERCHANT: MerchantSprite,
};

type Props = { coins: number; gems?: number; energy?: number; energyMax?: number; notifCount?: number; characterClass?: string | null };

export function DashboardTopbar({ coins, gems = 1280, energy = 5, energyMax = 5, notifCount = 3, characterClass }: Props) {
  const Sprite = SPRITES[characterClass ?? "SAGE"] ?? SageSprite;

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
        {[
          { icon: "🪙", val: coins.toLocaleString(), lbl: "Coins" },
          { icon: "💎", val: gems.toLocaleString(),  lbl: "Gems" },
          { icon: "⚡", val: `${energy}/${energyMax}`, lbl: "Energy" },
        ].map(s => (
          <div key={s.lbl} style={{ display: "flex", alignItems: "center", gap: 6, background: "#111520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "5px 12px" }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.val}</div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.38)" }}>{s.lbl}</div>
            </div>
          </div>
        ))}
        <button type="button" style={{ width: 30, height: 30, background: "#111520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>

      {/* Right: notif + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" style={{ position: "relative", width: 32, height: 32, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>🔔</span>
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

