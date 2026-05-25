"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Archive,
  Coins,
  Compass,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameAudio } from "@/hooks/use-game-audio";
import {
  CLASS_COLORS,
  IroncladSprite,
  MerchantSprite,
  PhantomSprite,
  SageSprite,
  type SpriteProps,
} from "@/lib/character-sprites";

type DashboardTabId = "mission" | "battle" | "status" | "oracle" | "vault" | "arena" | "guild";

type DashboardPanelsProps = Record<DashboardTabId, ReactNode>;

type DashboardProfile = {
  username: string;
  title: string;
  level: number;
  coins: number;
  expIntoLevel: number;
  expForNextLevel: number;
  characterClass?: string | null;
};

type DashboardTabsProps = DashboardPanelsProps & {
  profile: DashboardProfile;
};

type DashboardTab = {
  id: DashboardTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const battleTab: DashboardTab = {
  id: "battle",
  label: "Battle",
  description: "Boss raids, dungeon runs, and focus mode.",
  icon: Zap,
};

const tabs: DashboardTab[] = [
  {
    id: "mission",
    label: "Mission",
    description: "Quest board and daily mission flow.",
    icon: Compass,
  },
  {
    id: "status",
    label: "Profile",
    description: "Character card, stats, habits, and goals.",
    icon: Shield,
  },
  {
    id: "oracle",
    label: "Ranking",
    description: "Leaderboard, analytics, and coach insight.",
    icon: Trophy,
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

const allTabs = [tabs[0], battleTab, ...tabs.slice(1)];
const tabIds = new Set<DashboardTabId>(allTabs.map((tab) => tab.id));

const classLabels: Record<string, string> = {
  IRONCLAD: "Ironclad",
  SAGE: "Sage",
  PHANTOM: "Phantom",
  MERCHANT: "Merchant",
};

const characterSprites: Record<string, ComponentType<SpriteProps>> = {
  IRONCLAD: IroncladSprite,
  SAGE: SageSprite,
  PHANTOM: PhantomSprite,
  MERCHANT: MerchantSprite,
};

function getTabFromHash(): DashboardTabId {
  if (typeof window === "undefined") return "mission";
  const hash = window.location.hash.replace("#", "") as DashboardTabId;
  return tabIds.has(hash) ? hash : "mission";
}

export function DashboardTabs({ profile, mission, battle, status, oracle, vault, arena, guild }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("mission");
  const { play } = useGameAudio();
  const activeMeta = useMemo(
    () => allTabs.find((tab) => tab.id === activeTab) ?? tabs[0],
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

  const panels: DashboardPanelsProps = {
    mission,
    battle,
    status,
    oracle,
    vault,
    arena,
    guild,
  };

  return (
    <div className="grid w-full gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19.5rem_minmax(0,1fr)] 2xl:grid-cols-[21rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-[5.25rem] lg:h-[calc(100vh-6.5rem)] lg:self-start">
        <div className="flex h-full flex-col gap-3 rounded-3xl border border-white/[0.08] bg-[#0b0f18]/88 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-4">
          <PlayerCard profile={profile} onOpenStatus={() => switchTab("status")} />

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/60">
              Active Deck
            </p>
            <h2 className="mt-1 text-xl font-black text-white">{activeMeta.label}</h2>
            <p className="mt-1 text-xs leading-5 text-white/45">{activeMeta.description}</p>
          </div>

          <nav
            role="tablist"
            aria-label="Dashboard sections"
            className="grid grid-flow-col auto-cols-[minmax(10.5rem,1fr)] gap-2 overflow-x-auto pb-1 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-1 lg:overflow-visible lg:pb-0"
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isMissionGroup = tab.id === "mission";
              const isActive = tab.id === activeTab || (isMissionGroup && activeTab === "battle");

              return (
                <div key={tab.id} className="contents lg:block">
                  <button
                    role="tab"
                    type="button"
                    aria-selected={tab.id === activeTab}
                    onClick={() => switchTab(tab.id)}
                    className={cn(
                      "group relative flex min-h-24 min-w-0 flex-col justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/60 lg:min-h-[4.35rem] lg:flex-row lg:items-center lg:justify-start lg:gap-3",
                      isActive
                        ? "border-cyan-300/35 bg-cyan-300/12 text-white shadow-[0_0_28px_rgba(34,211,238,0.10)]"
                        : "border-white/[0.06] bg-white/[0.025] text-white/50 hover:border-white/15 hover:bg-white/[0.055] hover:text-white/80"
                    )}
                  >
                    {isActive && (
                      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent lg:inset-x-auto lg:inset-y-3 lg:left-0 lg:h-auto lg:w-px lg:bg-gradient-to-b" />
                    )}

                    <span className="flex items-center justify-between gap-2 lg:contents">
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-all",
                          isActive && "text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]"
                        )}
                      />
                      <span className="font-mono text-[9px] tracking-[0.25em] text-white/25 lg:order-3 lg:ml-auto">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[0.18em]">
                        {tab.label}
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-white/40 lg:max-w-[11rem]">
                        {tab.description}
                      </span>
                    </span>
                  </button>

                  {tab.id === "mission" && (
                    <SubNavButton
                      tab={battleTab}
                      active={activeTab === "battle"}
                      onClick={() => switchTab("battle")}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="min-w-0">
        <section id={activeTab} role="tabpanel" className="flex w-full min-w-0 flex-col gap-4 lg:gap-5">
          {panels[activeTab]}
        </section>
      </main>
    </div>
  );
}

function PlayerCard({
  profile,
  onOpenStatus,
}: {
  profile: DashboardProfile;
  onOpenStatus: () => void;
}) {
  const characterClass = profile.characterClass ?? "SAGE";
  const className = classLabels[characterClass] ?? "Adventurer";
  const colors = CLASS_COLORS[characterClass] ?? CLASS_COLORS.DEFAULT;
  const Sprite = characterSprites[characterClass] ?? SageSprite;
  const expTarget = Math.max(1, profile.expForNextLevel);
  const expValue = Math.max(0, profile.expIntoLevel);
  const expPercent = Math.min(100, Math.round((expValue / expTarget) * 100));

  return (
    <button
      type="button"
      className="group relative overflow-hidden rounded-3xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300/70"
      onClick={onOpenStatus}
      aria-label="Open character profile"
      style={{
        borderColor: `${colors.accent}45`,
        background:
          `linear-gradient(145deg, ${colors.primary}18, rgba(12,16,24,0.96) 42%, rgba(8,11,18,0.98))`,
        boxShadow: `0 18px 50px ${colors.glow}18`,
      }}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      <div className="relative flex items-start gap-3">
        <div
          className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-black/35"
          style={{ borderColor: `${colors.accent}55` }}
        >
          <Sprite className="h-24 w-20 translate-y-2" />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black uppercase tracking-[0.16em] text-white">
                {profile.username}
              </h3>
              <p className="mt-1 text-xs font-semibold text-white/65">{className}</p>
            </div>
            <div
              className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black text-white"
              style={{ borderColor: `${colors.accent}55`, backgroundColor: `${colors.primary}24` }}
            >
              <Shield className="h-3 w-3" />
              LV {profile.level}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/70">XP</span>
              <span className="font-mono text-[10px] text-white/55">
                {expValue}/{expTarget}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/45">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${expPercent}%`,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            <Sparkles className="h-3 w-3" />
            Title
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-white/70">{profile.title}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            <Coins className="h-3 w-3" />
            Coins
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-amber-200">
            {profile.coins.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="relative mt-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/45 transition group-hover:border-amber-300/35 group-hover:text-amber-200">
        Open Profile
      </div>
    </button>
  );
}

function SubNavButton({
  tab,
  active,
  onClick,
}: {
  tab: DashboardTab;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex min-h-20 min-w-0 flex-col justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300/60 lg:ml-6 lg:mt-2 lg:min-h-[3.8rem] lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:px-3",
        active
          ? "border-amber-300/35 bg-amber-300/12 text-white shadow-[0_0_28px_rgba(251,191,36,0.10)]"
          : "border-white/[0.06] bg-black/20 text-white/45 hover:border-amber-300/20 hover:bg-amber-300/[0.055] hover:text-white/80"
      )}
    >
      {active && (
        <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent lg:inset-x-auto lg:inset-y-3 lg:left-0 lg:h-auto lg:w-px lg:bg-gradient-to-b" />
      )}

      <Icon className={cn("h-5 w-5 shrink-0", active && "text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]")} />
      <span className="min-w-0">
        <span className="block text-xs font-black uppercase tracking-[0.18em]">{tab.label}</span>
        <span className="mt-1 block text-[11px] leading-snug text-white/40 lg:max-w-[10rem]">
          {tab.description}
        </span>
      </span>
    </button>
  );
}
