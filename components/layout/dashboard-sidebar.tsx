"use client";

import { useCallback, useEffect, useState } from "react";
import { CLASS_COLORS, IroncladSprite, MerchantSprite, PhantomSprite, SageSprite, type SpriteProps } from "@/lib/character-sprites";
import type { ComponentType } from "react";
import { preloadDashboardPanel } from "@/components/layout/dashboard-panel-preloader";
import { fetchCachedJson } from "@/lib/panel-data-cache";

const NAV = [
  { id: "dashboard",    label: "Dashboard",    icon: "home",         hash: "" },
  { id: "quests",       label: "Quests",       icon: "star",         hash: "mission" },
  { id: "boss",         label: "Boss Battle",  icon: "target",       hash: "battle" },
  { id: "inventory",    label: "Inventory",    icon: "bag",          hash: "inventory" },
  { id: "shop",         label: "Shop",         icon: "shop",         hash: "shop" },
  { id: "achievements", label: "Achievements", icon: "trophy",       hash: "achievements" },
  { id: "stats",        label: "Stats",        icon: "chart",        hash: "oracle" },
];

const ICON_SVG: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  target: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z",
  bag: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  shop: "M1 3h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6 M16 16a2 2 0 100 4 2 2 0 000-4z M9 16a2 2 0 100 4 2 2 0 000-4z",
  trophy: "M8 21h8 M12 17v4 M7 4H4.5a2.5 2.5 0 000 5H7 M17 4h2.5a2.5 2.5 0 010 5H17 M7 4h10v8a5 5 0 01-10 0V4z",
  chart: "M18 20V10 M12 20V4 M6 20v-6",
};

const SPRITES: Record<string, ComponentType<SpriteProps>> = {
  IRONCLAD: IroncladSprite, SAGE: SageSprite, PHANTOM: PhantomSprite, MERCHANT: MerchantSprite,
};

type Props = {
  username: string; title: string; level: number; coins: number;
  expIntoLevel: number; expForNextLevel: number; characterClass?: string | null;
};

export function DashboardSidebar({ username, level, expIntoLevel, expForNextLevel, characterClass }: Props) {
  const [activeId, setActiveId] = useState("dashboard");
  const [weeklyRank, setWeeklyRank] = useState<number | null>(null);

  useEffect(() => {
    fetchCachedJson<{ userRank?: number }>("/api/leaderboard")
      .then(d => { if (d?.userRank) setWeeklyRank(d.userRank); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const update = () => {
      const h = window.location.hash.replace("#", "");
      const found = NAV.find(n => n.hash === h);
      setActiveId(found ? found.id : "dashboard");
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const navigate = useCallback((item: typeof NAV[0]) => {
    if (item.hash) preloadDashboardPanel(item.hash);
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
    <aside className="dashboard-sidebar" style={{
      width: 220, flexShrink: 0, background: "#090d14",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 52px)", position: "sticky", top: 52,
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 10 }}>
        {NAV.map((item) => {
          const isActive = activeId === item.id;
          const svgPath = ICON_SVG[item.icon] ?? "";
          return (
            <button key={item.id} type="button" onClick={() => navigate(item)}
              onFocus={() => item.hash && preloadDashboardPanel(item.hash)}
              onMouseEnter={() => item.hash && preloadDashboardPanel(item.hash)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, border: "1px solid",
                borderColor: isActive ? "rgba(139,92,246,0.35)" : "transparent",
                background: isActive ? "rgba(139,92,246,0.18)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                textAlign: "left", width: "100%",
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? "#c4b5fd" : "currentColor"} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                {svgPath.split(" M").map((d, i) => (
                  <path key={i} d={i === 0 ? d : "M" + d} />
                ))}
              </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8 M12 17v4 M7 4H4.5a2.5 2.5 0 000 5H7 M17 4h2.5a2.5 2.5 0 010 5H17 M7 4h10v8a5 5 0 01-10 0V4z"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{weeklyRank !== null ? `#${weeklyRank}` : "#1"}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#3aaa7a" }}>Top player this week</div>
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
        <button type="button"
          onClick={() => navigate(NAV.find(i => i.id === "stats")!)}
          style={{
            width: "100%",
            background: `linear-gradient(145deg, ${colors.primary}18, #0c0f18 50%, #080b12)`,
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
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
            {expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()} EXP
          </div>
        </button>
      </div>
    </aside>
  );
}



