"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { label: "Home",      hash: "",            path: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
  { label: "Quests",    hash: "mission",     path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { label: "Battle",    hash: "battle",      path: "M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" },
  { label: "Inventory", hash: "inventory",   path: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0" },
  { label: "Shop",      hash: "shop",        path: "M1 3h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6 M16 16a2 2 0 100 4 2 2 0 000-4z M9 16a2 2 0 100 4 2 2 0 000-4z" },
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
    <nav className="mobile-bottom-nav" style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      background: "#090d14", borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "8px 4px",
    }}
    >
      {ITEMS.map((item) => {
        const isActive = item.hash === active;
        const color = isActive ? "#22d3ee" : "rgba(255,255,255,0.4)";
        return (
          <button key={item.label} type="button"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 10px", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => { window.location.hash = item.hash; window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.path.split(" M").map((d, i) => (
                <path key={i} d={i === 0 ? d : "M" + d} />
              ))}
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600, color }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
