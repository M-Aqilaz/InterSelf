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

type DashboardPanelsProps = Record<Exclude<DashboardTabId, "battle">, ReactNode>;

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
  battle: ReactNode;
};

type DashboardTab = {
  id: Exclude<DashboardTabId, "battle">;
  label: string;
  description: string;
  icon: LucideIcon;
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

const tabIds = new Set<DashboardTabId>([...tabs.map((tab) => tab.id), "battle"]);

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
  const [activeTab, setActiveTab] = useState<Exclude<DashboardTabId, "battle">>("mission");
  const [missionMode, setMissionMode] = useState<"quest" | "battle">("quest");
  const { play } = useGameAudio();
  const activeMeta = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab]
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hash = getTabFromHash();
      if (hash === "battle") {
        setActiveTab("mission");
        setMissionMode("battle");
      } else {
        setActiveTab(hash);
        setMissionMode("quest");
      }
    });

    const handleHashChange = () => {
      const hash = getTabFromHash();
      if (hash === "battle") {
        setActiveTab("mission");
        setMissionMode("battle");
      } else {
        setActiveTab(hash);
        setMissionMode("quest");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const switchTab = useCallback(
    (id: Exclude<DashboardTabId, "battle">) => {
      setActiveTab(id);
      setMissionMode("quest");
      void play("nav", 100);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [play]
  );

  const switchMissionMode = useCallback(
    (mode: "quest" | "battle") => {
      setActiveTab("mission");
      setMissionMode(mode);
      void play("nav", 100);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", mode === "battle" ? "#battle" : "#mission");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [play]
  );

  const panels: DashboardPanelsProps = {
    mission,
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
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
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
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="min-w-0">
        <section id={activeTab} role="tabpanel" className="flex w-full min-w-0 flex-col gap-4 lg:gap-5">
          {activeTab === "mission" ? (
            <MissionModePanel
              mode={missionMode}
              questContent={mission}
              battleContent={battle}
              onModeChange={switchMissionMode}
            />
          ) : (
            panels[activeTab]
          )}
        </section>
      </main>
    </div>
  );
}

function MissionModePanel({
  mode,
  questContent,
  battleContent,
  onModeChange,
}: {
  mode: "quest" | "battle";
  questContent: ReactNode;
  battleContent: ReactNode;
  onModeChange: (mode: "quest" | "battle") => void;
}) {
  const isBattle = mode === "battle";

  return (
    <>
      <div className="flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-[#0b0f18]/88 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.20)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
            Mission Console
          </p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            {isBattle ? "Battle Mode" : "Active Quests"}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {isBattle
              ? "Boss raids, dungeon runs, and focus combat."
              : "Daily quests, streak setup, and weekly objectives."}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onModeChange("quest")}
            className={cn(
              "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition",
              !isBattle
                ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                : "border-white/10 bg-white/[0.035] text-white/55 hover:text-white"
            )}
          >
            Quest Board
          </button>
          <button
            type="button"
            onClick={() => onModeChange("battle")}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition",
              isBattle
                ? "border-amber-300/45 bg-amber-300 text-black shadow-[0_0_28px_rgba(251,191,36,0.20)]"
                : "border-amber-300/35 bg-amber-300/12 text-amber-200 hover:bg-amber-300/18"
            )}
          >
            <Zap className="h-4 w-4" />
            Battle Mode
          </button>
        </div>
      </div>

      {isBattle ? battleContent : questContent}
    </>
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
