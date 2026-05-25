"use client";

import { CLASS_COLORS, getCharacterSprite } from "@/lib/character-sprites";

type Props = {
  username: string;
  title: string;
  level: number;
  expIntoLevel: number;
  expForNextLevel: number;
  hp?: number; hpMax?: number;
  energy?: number; energyMax?: number;
  coins: number;
  characterClass?: string | null;
};

export function CharacterCard({ username, level, expIntoLevel, expForNextLevel, hp = 90, hpMax = 100, energy = 5, energyMax = 5, coins, characterClass }: Props) {
  const charClass = characterClass ?? "SAGE";
  const colors = CLASS_COLORS[charClass] ?? CLASS_COLORS.DEFAULT;
  const Sprite = getCharacterSprite(charClass);
  const expPct = expForNextLevel > 0 ? Math.min(100, Math.round((expIntoLevel / expForNextLevel) * 100)) : 70;
  const labels: Record<string, string> = { IRONCLAD: "Iron Warden", SAGE: "Discipline Hunter", PHANTOM: "Shadow Stalker", MERCHANT: "Coin Collector" };
  const icons: Record<string, string> = { IRONCLAD: "🛡️", SAGE: "🛡️", PHANTOM: "🗡️", MERCHANT: "💰" };

  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column",
      overflow: "hidden", borderRadius: 16,
      border: `1px solid ${colors.accent}35`,
      background: `linear-gradient(160deg, ${colors.primary}30 0%, #12093a 35%, #080b15 100%)`,
      minHeight: 440,
    }}>
      {/* Glow */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 10%, ${colors.primary}25 0%, transparent 55%)`, pointerEvents: "none" }} />

      {/* LEVEL badge */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        background: "#fff", color: "#111", fontFamily: "monospace", fontSize: 10,
        fontWeight: 900, padding: "4px 14px", borderRadius: "0 0 10px 10px",
        letterSpacing: "0.1em", whiteSpace: "nowrap", zIndex: 10,
      }}>
        LEVEL {level}
      </div>

      {/* Sprite area */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", paddingTop: 28, height: 240 }}>
        <div style={{
          position: "relative", width: "100%", height: "100%",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          background: `radial-gradient(ellipse at 50% 90%, ${colors.primary}22 0%, transparent 60%)`,
        }}>
          <Sprite style={{ height: 210, width: 175, position: "relative", zIndex: 1 }} />
          <div style={{
            position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
            width: 80, height: 10, background: `${colors.primary}45`, borderRadius: "50%", filter: "blur(8px)",
          }} />
        </div>
      </div>

      {/* Info */}
      <div style={{ position: "relative", padding: "10px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 20, height: 20, background: `${colors.primary}35`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
            {icons[charClass] ?? "🛡️"}
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{username}</span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
          {labels[charClass] ?? "Adventurer"}
        </div>

        {/* EXP */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
          <span>EXP Progress</span>
          <span>{expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()} <span style={{ fontWeight: 700, color: colors.accent }}>{expPct}%</span></span>
        </div>
        <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: "100%", width: `${expPct}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`, borderRadius: 4 }} />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { icon: "❤️", val: `${hp}/${hpMax}`, lbl: "HP" },
            { icon: "⚡", val: `${energy}/${energyMax}`, lbl: "Energy" },
            { icon: "🪙", val: coins.toLocaleString(), lbl: "Coins", color: "#f59e0b" },
          ].map((s) => (
            <div key={s.lbl} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color ?? "#fff" }}>{s.val}</div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
