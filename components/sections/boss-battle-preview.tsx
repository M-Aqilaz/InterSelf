"use client";

import { useCallback, useEffect, useState } from "react";

type BossState = {
  bossName?: string;
  bossLevel?: number;
  currentHp?: number;
  maxHp?: number;
  weeklyDamage?: number;
};

export function BossBattlePreview({ productivityCompletion = 0 }: { productivityCompletion?: number }) {
  const [state, setState] = useState<BossState | null>(null);

  useEffect(() => {
    fetch("/api/boss/state", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setState(d))
      .catch(() => {});
  }, []);

  const bossName = state?.bossName ?? "Procrastination Demon";
  const bossLevel = state?.bossLevel ?? 25;
  const maxHp = state?.maxHp ?? 10000;
  const currentHp = state?.currentHp ?? 7450;
  const hpPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 74;
  const damage = state?.weeklyDamage ?? 2550;

  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column",
      overflow: "hidden", borderRadius: 16, border: "1px solid rgba(239,68,68,0.18)",
      background: "linear-gradient(160deg, #1c0810 0%, #0e0814 50%, #080b15 100%)",
      minHeight: 440,
    }}>
      {/* Aura */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, rgba(180,0,0,0.22) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <span>⚔️</span><span>Boss Battle</span>
        </div>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", cursor: "pointer" }}>?</span>
      </div>

      {/* Boss name */}
      <div style={{ position: "relative", textAlign: "center", padding: "4px 16px 0" }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#f87171" }}>{bossName}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Level {bossLevel} Boss</div>
      </div>

      {/* Boss SVG — contained, no overflow */}
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
        <svg viewBox="0 0 160 155" style={{ width: "75%", maxWidth: 220, display: "block" }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="aura" cx="50%" cy="55%" r="50%">
              <stop offset="0%" stopColor="#7c0000" stopOpacity="0.45"/>
              <stop offset="100%" stopColor="#080b12" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="145" rx="62" ry="10" fill="url(#aura)"/>
          {/* Body */}
          <path d="M30 88 Q20 120 24 148 Q80 142 136 148 Q140 120 130 88 Q112 72 80 70 Q48 72 30 88Z" fill="#1a0505"/>
          <path d="M36 94 Q28 122 30 146 Q80 140 130 146 Q132 122 124 94" fill="#240808"/>
          {/* Chest armor */}
          <rect x="60" y="100" width="40" height="40" rx="4" fill="#1a0505"/>
          <path d="M64 104 L96 104 L96 138 L64 138Z" fill="#230d0d"/>
          <path d="M78 104 L82 104 L82 138 L78 138Z" fill="#dc262615"/>
          <path d="M64 116 L96 116 M64 128 L96 128" stroke="#dc2626" strokeWidth="0.8" opacity=".35"/>
          {/* Arms */}
          <path d="M30 91 Q14 102 16 118 Q21 115 26 107 Q29 98 34 93Z" fill="#1a0505"/>
          <path d="M130 91 Q146 102 144 118 Q139 115 134 107 Q131 98 126 93Z" fill="#1a0505"/>
          {/* Claws */}
          <path d="M15 119 L9 113 M15 119 L11 126 M15 119 L19 125 M15 119 L21 113" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" opacity=".8"/>
          <path d="M145 119 L151 113 M145 119 L149 126 M145 119 L141 125 M145 119 L139 113" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" opacity=".8"/>
          {/* Wings */}
          <path d="M30 90 Q10 74 6 50 Q24 56 34 74 Q30 84 34 92Z" fill="#1a0505" opacity=".9"/>
          <path d="M130 90 Q150 74 154 50 Q136 56 126 74 Q130 84 126 92Z" fill="#1a0505" opacity=".9"/>
          <path d="M8 54 Q16 46 14 36" stroke="#dc2626" strokeWidth="1.2" opacity=".3" fill="none"/>
          <path d="M152 54 Q144 46 146 36" stroke="#dc2626" strokeWidth="1.2" opacity=".3" fill="none"/>
          {/* Neck */}
          <rect x="68" y="58" width="24" height="14" rx="5" fill="#1a0505"/>
          {/* Head */}
          <ellipse cx="80" cy="40" rx="34" ry="36" fill="#0d0202"/>
          <rect x="48" y="16" width="64" height="48" rx="9" fill="#1a0505"/>
          <rect x="52" y="20" width="56" height="40" rx="6" fill="#2d1010"/>
          <rect x="58" y="28" width="44" height="24" rx="4" fill="#0d0404"/>
          {/* Eyes — glowing red */}
          <ellipse cx="70" cy="38" rx="8" ry="7" fill="#dc2626" opacity=".95"/>
          <ellipse cx="90" cy="38" rx="8" ry="7" fill="#dc2626" opacity=".95"/>
          <ellipse cx="70" cy="38" rx="4" ry="3.5" fill="#fca5a5"/>
          <ellipse cx="90" cy="38" rx="4" ry="3.5" fill="#fca5a5"/>
          <ellipse cx="71" cy="38" rx="2" ry="2.5" fill="#1a0505"/>
          <ellipse cx="91" cy="38" rx="2" ry="2.5" fill="#1a0505"/>
          <ellipse cx="70" cy="38" rx="11" ry="10" fill="#dc2626" opacity=".18"/>
          <ellipse cx="90" cy="38" rx="11" ry="10" fill="#dc2626" opacity=".18"/>
          {/* Mouth */}
          <path d="M62 56 Q67 62 74 59 L80 63 L86 59 Q93 62 98 56" fill="#0d0404" stroke="#dc2626" strokeWidth="1.5" opacity=".75"/>
          <path d="M66 57 L68 62 M80 60 L80 65 M94 57 L92 62" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity=".6"/>
          {/* Horns */}
          <path d="M50 16 L40 -2 L52 12Z" fill="#1a0505"/>
          <path d="M110 16 L120 -2 L108 12Z" fill="#1a0505"/>
          <path d="M58 12 L50 -2 L60 8Z" fill="#220808"/>
          <path d="M102 12 L110 -2 L100 8Z" fill="#220808"/>
          {/* Aura particles */}
          <circle cx="22" cy="70" r="2.5" fill="#dc2626" opacity=".45"/>
          <circle cx="138" cy="70" r="2.5" fill="#dc2626" opacity=".4"/>
          <circle cx="56" cy="10" r="1.8" fill="#dc2626" opacity=".3"/>
          <circle cx="104" cy="8" r="1.8" fill="#dc2626" opacity=".35"/>
        </svg>
      </div>

      {/* HP bar */}
      <div style={{ position: "relative", padding: "0 16px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, fontSize: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Boss HP</span>
          <span style={{ fontWeight: 700, color: "#f87171" }}>{currentHp.toLocaleString()} / {maxHp.toLocaleString()}</span>
          <span style={{ fontWeight: 900, color: "#f87171" }}>{hpPercent}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${hpPercent}%`, background: "linear-gradient(90deg, #dc2626, #ef4444)", borderRadius: 4 }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px 10px" }}>
        <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>⚡ Damage Dealt</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{damage.toLocaleString()}</div>
        </div>
        <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>Rewards</div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>+500 XP</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>🪙+200</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div style={{ position: "relative", padding: "0 16px 16px" }}>
        <button type="button"
          style={{ width: "100%", background: "#dc2626", border: "none", borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 900, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onClick={() => { window.location.hash = "battle"; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          ⚔️ View Battle
        </button>
      </div>
    </div>
  );
}
