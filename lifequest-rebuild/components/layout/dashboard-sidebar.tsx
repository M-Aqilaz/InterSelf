"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CLASS_COLORS,
  IroncladSprite,
  MerchantSprite,
  PhantomSprite,
  SageSprite,
  type SpriteProps,
} from "@/lib/character-sprites";
import type { ComponentType } from "react";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  hash: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", hash: "" },
  { id: "habits", label: "Habits", icon: "✨", hash: "#status" },
  { id: "quests", label: "Quests", icon: "⭐", hash: "#mission" },
  { id: "boss", label: "Boss Battle", icon: "🎯", hash: "#battle" },
  { id: "inventory", label: "Inventory", icon: "🎒", hash: "#vault" },
  { id: "shop", label: "Shop", icon: "🏪", hash: "#vault" },
  { id: "achievements", label: "Achievements", icon: "🏆", hash: "#vault" },
  { id: "stats", label: "Stats", icon: "📊", hash: "#oracle" },
];

const characterSprites: Record<string, ComponentType<SpriteProps>> = {
  IRONCLAD: IroncladSprite,
  SAGE: SageSprite,
  PHANTOM: PhantomSprite,
  MERCHANT: MerchantSprite,
};

type DashboardSidebarProps = {
  username: string;
  title: string;
  level: number;
  coins: number;
  expIntoLevel: number;
  expForNextLevel: number;
  characterClass?: string | null;
  weeklyRank?: number;
  weeklyRankPercent?: number;
};

export function DashboardSidebar({
  username,
  title,
  level,
  coins,
  expIntoLevel,
  expForNextLevel,
  characterClass,
  weeklyRank = 24,
  weeklyRankPercent = 8,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>("dashboard");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) setActiveId("dashboard");
    else if (hash === "mission") setActiveId("quests");
    else if (hash === "battle") setActiveId("boss");
    else if (hash === "status") setActiveId("habits");
    else if (hash === "vault") setActiveId("inventory");
    else if (hash === "oracle") setActiveId("stats");
    else setActiveId("dashboard");

    const handleHash = () => {
      const h = window.location.hash.replace("#", "");
      if (!h) setActiveId("dashboard");
      else if (h === "mission") setActiveId("quests");
      else if (h === "battle") setActiveId("boss");
      else if (h === "status") setActiveId("habits");
      else if (h === "vault") setActiveId("inventory");
      else if (h === "oracle") setActiveId("stats");
      else setActiveId("dashboard");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigate = useCallback(
    (item: NavItem) => {
      setActiveId(item.id);
      if (item.hash) {
        window.location.hash = item.hash.replace("#", "");
      } else {
        router.push("/dashboard");
        window.history.replaceState(null, "", "/dashboard");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router]
  );

  const charClass = characterClass ?? "SAGE";
  const colors = CLASS_COLORS[charClass] ?? CLASS_COLORS.DEFAULT;
  const Sprite = characterSprites[charClass] ?? SageSprite;
  const expPercent =
    expForNextLevel > 0 ? Math.min(100, Math.round((expIntoLevel / expForNextLevel) * 100)) : 70;

  return (
    <aside
      className="flex h-[calc(100vh-52px)] w-[220px] shrink-0 flex-col overflow-y-auto border-r"
      style={{
        background: "#090d14",
        borderColor: "rgba(255,255,255,0.07)",
        position: "sticky",
        top: "52px",
      }}
    >
      <div className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-[9px] text-left text-xs font-semibold transition-all duration-150",
                isActive
                  ? "text-white"
                  : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
              style={
                isActive
                  ? {
                      background: "rgba(139,92,246,0.18)",
                      borderColor: "rgba(139,92,246,0.3)",
                    }
                  : {}
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Weekly Rank */}
      <div className="px-3 pb-2">
        <div
          className="rounded-xl border p-3"
          style={{ background: "#111520", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
            Weekly Rank
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div className="flex-1">
              <div className="text-lg font-black text-white">#{weeklyRank}</div>
              <div className="text-[10px] font-semibold" style={{ color: "#3aaa7a" }}>
                ▲ Top {weeklyRankPercent}% this week
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-[2px]">
              <div className="w-[5px] rounded-sm" style={{ height: "20px", background: "#3aaa7a" }} />
              <div className="w-[5px] rounded-sm" style={{ height: "14px", background: "#161c2a" }} />
              <div className="w-[5px] rounded-sm" style={{ height: "10px", background: "#161c2a" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Player Mini Card */}
      <div className="px-3 pb-4">
        <button
          type="button"
          className="w-full overflow-hidden rounded-xl border p-3 text-left transition hover:-translate-y-0.5"
          style={{
            borderColor: `${colors.accent}45`,
            background: `linear-gradient(145deg, ${colors.primary}15, #0c0f18 50%, #080b12)`,
          }}
          onClick={() => navigate(NAV_ITEMS.find((i) => i.id === "habits")!)}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
              style={{ borderColor: `${colors.accent}40`, background: "rgba(0,0,0,0.4)" }}
            >
              <Sprite className="h-12 w-10 translate-y-1" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-white">{username}</div>
              <div className="text-[10px] text-white/50">Level {level}</div>
            </div>
            <div
              className="shrink-0 rounded-full border px-2 py-[2px] font-mono text-[9px] font-black text-white"
              style={{ borderColor: `${colors.accent}50`, background: `${colors.primary}20` }}
            >
              LV {level}
            </div>
          </div>

          <div className="mt-3">
            <div className="h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${expPercent}%`,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-white/40">
              <span>{expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()} EXP</span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
