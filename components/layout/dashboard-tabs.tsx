"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Archive,
  BookOpen,
  Compass,
  Shield,
  Swords,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameAudio } from "@/hooks/use-game-audio";

type DashboardTabId = "mission" | "battle" | "status" | "oracle" | "vault" | "arena" | "guild";

type DashboardTabsProps = Record<DashboardTabId, ReactNode>;

type DashboardTab = {
  id: DashboardTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const tabs: DashboardTab[] = [
  {
    id: "mission",
    label: "Mission",
    description: "Daily quest briefing and task list.",
    icon: Compass,
  },
  {
    id: "battle",
    label: "Battle",
    description: "Focus sessions, boss raids, dungeon, and PvP.",
    icon: Zap,
  },
  {
    id: "status",
    label: "Status",
    description: "Character stats, habits, and goals.",
    icon: Shield,
  },
  {
    id: "oracle",
    label: "Oracle",
    description: "Weekly arcs, AI coach, and analytics.",
    icon: BookOpen,
  },
  {
    id: "vault",
    label: "Vault",
    description: "Inventory, achievements, ranking, and friends.",
    icon: Archive,
  },
  {
    id: "arena",
    label: "Arena",
    description: "PvP preview and competitive systems.",
    icon: Swords,
  },
  {
    id: "guild",
    label: "Guild",
    description: "Friends, requests, and party activity.",
    icon: Users,
  },
];

const tabIds = new Set<DashboardTabId>(tabs.map((tab) => tab.id));

function getTabFromHash(): DashboardTabId {
  if (typeof window === "undefined") return "mission";
  const hash = window.location.hash.replace("#", "") as DashboardTabId;
  return tabIds.has(hash) ? hash : "mission";
}

export function DashboardTabs({ mission, battle, status, oracle, vault, arena, guild }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("mission");
  const { play } = useGameAudio();
  const activeMeta = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab]
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setActiveTab(getTabFromHash());
    });

    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const switchTab = useCallback(
    (id: DashboardTabId) => {
      setActiveTab(id);
      void play("nav", 100);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [play]
  );

  const panels: DashboardTabsProps = {
    mission,
    battle,
    status,
    oracle,
    vault,
    arena,
    guild,
  };

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-6">
      <div className="rounded-3xl border border-white/[0.08] bg-[#0b0f18]/80 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-4">
        <div className="mb-4 flex flex-col gap-1 px-1 py-1 sm:px-2 lg:flex-row lg:items-end lg:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/60">
            Active Deck
          </p>
          <div className="flex flex-col gap-1 lg:items-end lg:text-right">
            <h2 className="text-2xl font-black text-white">{activeMeta.label}</h2>
            <p className="max-w-xl text-sm text-white/55">{activeMeta.description}</p>
          </div>
        </div>

        <nav
          role="tablist"
          aria-label="Dashboard sections"
          className="grid grid-flow-col auto-cols-[minmax(10rem,1fr)] gap-2 overflow-x-auto pb-1 lg:grid-flow-row lg:grid-cols-7 lg:overflow-visible lg:pb-0 2xl:gap-3"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => switchTab(tab.id)}
                className={cn(
                  "group relative flex min-h-24 min-w-0 flex-col justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/60",
                  isActive
                    ? "border-cyan-300/35 bg-cyan-300/12 text-white shadow-[0_0_28px_rgba(34,211,238,0.10)]"
                    : "border-white/[0.06] bg-white/[0.025] text-white/50 hover:border-white/15 hover:bg-white/[0.055] hover:text-white/80"
                )}
              >
                {isActive && (
                  <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
                )}

                <span className="flex items-center justify-between gap-2">
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-all",
                      isActive && "text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]"
                    )}
                  />
                  <span className="font-mono text-[9px] tracking-[0.25em] text-white/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>

                <span>
                  <span className="block text-xs font-black uppercase tracking-[0.18em]">
                    {tab.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-white/40">
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <section id={activeTab} role="tabpanel" className="flex w-full flex-col gap-4 lg:gap-5">
        {panels[activeTab]}
      </section>
    </div>
  );
}
