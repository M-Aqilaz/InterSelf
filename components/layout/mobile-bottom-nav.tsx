"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { label: "Home",      icon: "🏠", hash: "" },
  { label: "Habits",    icon: "✨", hash: "status" },
  { label: "Quests",    icon: "📋", hash: "mission" },
  { label: "Battle",    icon: "⚔️", hash: "battle" },
  { label: "Inventory", icon: "🎒", hash: "inventory" },
  { label: "Shop",      icon: "🏪", hash: "shop" },
];

export function MobileBottomNav() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const u = () => setActive(window.location.hash.replace("#", ""));
    u();
    window.addEventListener("hashchange", u);
    return () => window.removeEventListener("hashchange", u);
  }, []);

  return (
    <nav style={{
      position: "sticky", bottom: 0, zIndex: 40,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      background: "#090d14", borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "8px 4px",
    }}
    className="xl:hidden">
      {ITEMS.map((item) => {
        const isActive = item.hash === active;
        return (
          <button key={item.label} type="button"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", background: "none", border: "none", cursor: "pointer", color: isActive ? "#22d3ee" : "rgba(255,255,255,0.4)" }}
            onClick={() => { window.location.hash = item.hash; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

