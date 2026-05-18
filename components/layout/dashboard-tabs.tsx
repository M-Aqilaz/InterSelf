"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Archive, BookOpen, Compass, Shield, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameAudio } from "@/hooks/use-game-audio";

type DashboardTabId = "mission" | "battle" | "status" | "journal" | "vault";

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
    id: "journal",
    label: "Journal",
    description: "Weekly arcs, AI coach, and analytics.",
    icon: BookOpen,
  },
  {
    id: "vault",
    label: "Vault",
    description: "Inventory, achievements, ranking, and friends.",
    icon: Archive,
  },
];

const tabIds = new Set<DashboardTabId>(tabs.map((tab) => tab.id));

function getTabFromHash(): DashboardTabId {
  if (typeof window === "undefined") return "mission";
  const hash = window.location.hash.replace("#", "") as DashboardTabId;
  return tabIds.has(hash) ? hash : "mission";
}

export function DashboardTabs({ mission, battle, status, journal, vault }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("mission");
  const { play } = useGameAudio();

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
    journal,
    vault,
  };

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-6 lg:max-w-7xl lg:gap-8">
      <nav
        role="tablist"
        aria-label="Dashboard sections"
        className="relative flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-[#05060f]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

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
                "group relative flex flex-1 flex-col items-center gap-1.5 px-2 py-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/60",
                isActive ? "text-cyan-300" : "text-white/35 hover:text-white/70"
              )}
            >
              {index > 0 && (
                <span className="pointer-events-none absolute left-0 top-[20%] h-[60%] w-px bg-white/[0.06]" />
              )}

              {isActive && (
                <>
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-400/[0.07] to-transparent" />
                </>
              )}

              <span
                className={cn(
                  "font-mono text-[9px] tracking-[0.3em] transition-colors",
                  isActive ? "text-cyan-400/70" : "text-white/15 group-hover:text-white/30"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-all", isActive && "drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]")} />

              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                  isActive ? "text-white" : ""
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <section id={activeTab} role="tabpanel" className="flex w-full flex-col gap-6">
        {panels[activeTab]}
      </section>
    </div>
  );
}
