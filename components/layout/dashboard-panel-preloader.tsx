"use client";

import { useEffect } from "react";
import { fetchCachedJson } from "@/lib/panel-data-cache";

const PANEL_IMPORTS: Record<string, Array<() => Promise<unknown>>> = {
  battle: [() => import("@/components/sections/boss-battle")],
  status: [
    () => import("@/components/sections/character-profile-panel"),
    () => import("@/components/sections/habit-tracker-panel"),
    () => import("@/components/sections/goal-planner-panel"),
  ],
  inventory: [() => import("@/components/sections/inventory-panel")],
  shop: [() => import("@/components/sections/shop-panel")],
  achievements: [() => import("@/components/sections/achievements-panel")],
  oracle: [
    () => import("@/components/sections/leaderboard-panel"),
    () => import("@/components/sections/productivity-analytics-panel"),
  ],
};

const PANEL_ENDPOINTS: Record<string, string[]> = {
  battle: ["/api/boss/state", "/api/energy"],
  inventory: ["/api/inventory"],
  shop: ["/api/shop"],
  achievements: ["/api/achievements"],
  oracle: ["/api/leaderboard"],
};

export function preloadDashboardPanel(hash: string) {
  const panelImports = PANEL_IMPORTS[hash] ?? [];
  const endpoints = PANEL_ENDPOINTS[hash] ?? [];

  void Promise.allSettled(panelImports.map((loadPanel) => loadPanel()));
  void Promise.allSettled(endpoints.map((endpoint) => fetchCachedJson(endpoint)));
}

export function DashboardPanelPreloader() {
  useEffect(() => {
    const preload = () => {
      for (const hash of Object.keys(PANEL_IMPORTS)) {
        preloadDashboardPanel(hash);
      }
    };

    const warmImmediately = setTimeout(preload, 0);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 2500 });
      return () => {
        clearTimeout(warmImmediately);
        window.cancelIdleCallback(id);
      };
    }

    return () => clearTimeout(warmImmediately);
  }, []);

  return null;
}
