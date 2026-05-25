"use client";

import { useEffect, useState } from "react";

type NavItem = { label: string; icon: string; hash: string };

const ITEMS: NavItem[] = [
  { label: "Home", icon: "🏠", hash: "" },
  { label: "Habits", icon: "✨", hash: "status" },
  { label: "Quests", icon: "📋", hash: "mission" },
  { label: "Battle", icon: "⚔️", hash: "battle" },
  { label: "Inventory", icon: "🎒", hash: "vault" },
  { label: "Shop", icon: "🏪", hash: "vault" },
];

export function MobileBottomNav() {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const update = () => setActiveHash(window.location.hash.replace("#", ""));
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return (
    <nav
      className="sticky bottom-0 z-30 flex items-center justify-around border-t px-2 py-2 xl:hidden"
      style={{
        background: "#090d14",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {ITEMS.map((item) => {
        const isActive = item.hash === activeHash;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              window.location.hash = item.hash;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-[3px] px-3 py-1"
            style={{ color: isActive ? "#22d3ee" : "rgba(255,255,255,0.4)" }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="text-[9px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
