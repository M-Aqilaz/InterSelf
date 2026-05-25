"use client";

import { useCallback, useEffect, useState } from "react";
import { CLASS_COLORS, IroncladSprite, MerchantSprite, PhantomSprite, SageSprite, type SpriteProps } from "@/lib/character-sprites";
import type { ComponentType } from "react";

const NAV = [
  { id: "dashboard",    label: "Dashboard",    icon: "🏠", hash: "" },
  { id: "habits",       label: "Habits",       icon: "✨", hash: "status" },
  { id: "quests",       label: "Quests",       icon: "⭐", hash: "mission" },
  { id: "boss",         label: "Boss Battle",  icon: "🎯", hash: "battle" },
  { id: "inventory",    label: "Inventory",    icon: "🎒", hash: "inventory" },
  { id: "shop",         label: "Shop",         icon: "🏪", hash: "shop" },
  { id: "achievements", label: "Achievements", icon: "🏆", hash: "achievements" },
  { id: "stats",        label: "Stats",        icon: "📊", hash: "oracle" },
];

const SPRITES: Record<string, ComponentType<SpriteProps>> = {
  IRONCLAD: IroncladSprite, SAGE: SageSprite, PHANTOM: PhantomSprite, MERCHANT: MerchantSprite,
};

type Props = {
  username: string;
  title: string;
  level: number;
  coins: number;
  expIntoLevel: number;
  expForNextLevel: number;
  characterClass?: string | null;
};

export function DashboardSidebar({ username, level, expIntoLevel, expForNextLevel, characterClass }: Props) {
  const [activeId, setActiveId] = useState("dashboard");

  useEffect(() => {
    const update = () => {
      const h = window.location.hash.replace("#", "");
      if (!h || h === "mission") setActiveId("dashboard");
      else if (h === "battle") setActiveId("boss");
      else if (h === "status") setActiveId("habits");
      else if (h === "vault") setActiveId("inventory");
      else if (h === "oracle") setActiveId("stats");
      else setActiveId("dashboard");
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const navigate = useCallback((item: typeof NAV[0]) => {
    setActiveId(item.id);
    if (item.hash) {
      window.location.hash = item.hash;
    } else {
      window.history.replaceState(null, "", "/dashboard");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const charClass = characterClass ?? "SAGE";
  const colors = CLASS_COLORS[charClass] ?? CLASS_COLORS.DEFAULT;
  const Sprite = SPRITES[charClass] ?? SageSprite;
  const expPercent = expForNextLevel > 0 ? Math.min(100, Math.round((expIntoLevel / expForNextLevel) * 100)) : 70;

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: "#090d14",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 52px)", position: "sticky", top: 52,
      overflowY: "auto",
    }}>
      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 10 }}>
        {NAV.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button key={item.id} type="button" onClick={() => navigate(item)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, border: "1px solid",
                borderColor: isActive ? "rgba(139,92,246,0.35)" : "transparent",
                background: isActive ? "rgba(139,92,246,0.18)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                textAlign: "left", width: "100%", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)"; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)"; } }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Weekly Rank */}
      <div style={{ padding: "0 10px 8px" }}>
        <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Weekly Rank</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>#24</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#3aaa7a" }}>▲ Top 8% this week</div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <div style={{ width: 5, height: 20, background: "#3aaa7a", borderRadius: 3 }} />
              <div style={{ width: 5, height: 14, background: "#1e2535", borderRadius: 3 }} />
              <div style={{ width: 5, height: 10, background: "#1e2535", borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Player card */}
      <div style={{ padding: "0 10px 16px" }}>
        <button type="button" onClick={() => navigate(NAV.find(i => i.id === "habits")!)}
          style={{
            width: "100%", background: `linear-gradient(145deg, ${colors.primary}18, #0c0f18 50%, #080b12)`,
            border: `1px solid ${colors.accent}40`, borderRadius: 12, padding: 12,
            cursor: "pointer", textAlign: "left",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${colors.accent}40`, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <Sprite style={{ width: 38, height: 46, transform: "translateY(4px)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Level {level}</div>
            </div>
            <div style={{ flexShrink: 0, background: `${colors.primary}25`, border: `1px solid ${colors.accent}50`, borderRadius: 20, padding: "2px 8px", fontFamily: "monospace", fontSize: 9, fontWeight: 900, color: "#fff" }}>
              LV {level}
            </div>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", width: `${expPercent}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`, borderRadius: 3 }} />
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", display: "flex", justifyContent: "space-between" }}>
            <span>{expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()} EXP</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

