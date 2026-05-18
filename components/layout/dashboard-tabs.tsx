"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { BarChart3, Compass, Gift, Sparkles, Timer, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameAudio } from "@/hooks/use-game-audio";

type DashboardTabId = "today" | "focus" | "progress" | "insights" | "rewards";

type DashboardTabsProps = Record<DashboardTabId, ReactNode>;

type DashboardTab = {
  id: DashboardTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const tabs: DashboardTab[] = [
  {
    id: "today",
    label: "Today",
    description: "Start here. See the next mission and daily momentum.",
    icon: Compass,
  },
  {
    id: "focus",
    label: "Focus",
    description: "Run focus sessions and fight the active boss.",
    icon: Timer,
  },
  {
    id: "progress",
    label: "Progress",
    description: "Manage tasks, habits, goals, EXP, and weekly arcs.",
    icon: BarChart3,
  },
  {
    id: "insights",
    label: "Insights",
    description: "Review coaching signals and productivity analytics.",
    icon: Sparkles,
  },
  {
    id: "rewards",
    label: "Rewards",
    description: "Check inventory, achievements, friends, and exploration.",
    icon: Gift,
  },
];

const tabIds = new Set<DashboardTabId>(tabs.map((tab) => tab.id));

function getTabFromHash(): DashboardTabId {
  if (typeof window === "undefined") return "today";
  const hash = window.location.hash.replace("#", "") as DashboardTabId;
  return tabIds.has(hash) ? hash : "today";
}

export function DashboardTabs({ today, focus, progress, insights, rewards }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("today");
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
    today,
    focus,
    progress,
    insights,
    rewards,
  };

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-6 lg:max-w-7xl lg:gap-8">
      <section className="rounded-3xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
        <div className="grid gap-2 md:grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={cn(
                  "flex min-h-20 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  isActive
                    ? "border-cyan-300/50 bg-cyan-300/15 text-white shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                    : "border-white/5 bg-white/[0.03] text-white/65 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                )}
                aria-pressed={isActive}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    isActive ? "border-cyan-200/50 bg-cyan-200/15" : "border-white/10 bg-black/20"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{tab.label}</span>
                  <span className="mt-1 hidden text-xs leading-snug text-white/55 xl:block">
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="px-1">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Command Deck</p>
          <h1 className="mt-1 text-2xl font-black text-white">{activeMeta.label}</h1>
          <p className="mt-1 text-sm text-white/65">{activeMeta.description}</p>
        </div>
        <div id={activeTab} className="flex w-full flex-col gap-6">
          {panels[activeTab]}
        </div>
      </section>
    </div>
  );
}
