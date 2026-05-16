"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { BossBattleState, BossBattleSummary } from "@/types/boss";
import { subscribeToTasksUpdate, subscribeToBossDamage, BossDamagePayload } from "@/lib/events";
import { useGameAudio } from "@/hooks/use-game-audio";

const formatter = new Intl.NumberFormat();

function formatMs(ms: number) {
  if (ms <= 0) return "Ready";
  const seconds = Math.ceil(ms / 1000);
  return `${seconds}s`;
}

type DamageBurst = {
  id: string;
  value: number;
  critical?: boolean;
};

type VictoryState = {
  exp: number;
  coins: number;
  itemName?: string | null;
};

type BattlePhase =
  | "READY"
  | "PLAYER_ATTACK"
  | "BOSS_HIT"
  | "BOSS_COUNTER"
  | "COOLDOWN"
  | "VICTORY";

type SkillButton = {
  id: string;
  label: string;
  description: string;
  cooldown?: number;
  disabled?: boolean;
  energyCost: number;
  element: string;
};

type PlayerInfo = {
  username: string;
  title: string | null;
  rank: string | null;
  level: number | null;
};

type BossBattlePanelProps = {
  productivityCompletion?: number;
};

export function BossBattlePanel({ productivityCompletion = 0 }: BossBattlePanelProps = {}) {
  const [state, setState] = useState<BossBattleState | null>(null);
  const [pending, startTransition] = useTransition();
  const [damageBursts, setDamageBursts] = useState<DamageBurst[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [victory, setVictory] = useState<VictoryState | null>(null);
  const [showLoot, setShowLoot] = useState<VictoryState | null>(null);
  const [phase, setPhase] = useState<BattlePhase>("READY");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [slashVisible, setSlashVisible] = useState(false);
  const [counterVisible, setCounterVisible] = useState(false);
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [energy, setEnergy] = useState(70);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [monsterVariant, setMonsterVariant] = useState<number>(0);
  const { play } = useGameAudio();

  const skills: SkillButton[] = useMemo(
    () => [
      { id: "basic", label: "Basic Strike", description: "Reliable attack", energyCost: 10, element: "kinetic" },
      { id: "focus", label: "Focus Slash", description: "+15% damage", cooldown: 30, energyCost: 20, element: "wind" },
      { id: "discipline", label: "Discipline Break", description: "Shreds defenses", cooldown: 60, disabled: true, energyCost: 35, element: "holy" },
      { id: "ultimate", label: "Awakening Nova", description: "Massive burst", cooldown: 120, disabled: true, energyCost: 60, element: "starlight" },
    ],
    []
  );

  const fetchState = useCallback(async () => {
    const res = await fetch("/api/boss/state");
    if (!res.ok) return;
    const data = (await res.json()) as BossBattleState;
    setState(data);
    if (data.cooldownRemainingMs > 0) {
      setPhase("COOLDOWN");
    } else if (!data.boss) {
      setPhase("READY");
    }
    setMonsterVariant((prev) => (data.boss && prev === 0 ? Math.max(1, data.boss.id % 3) : prev || 1));
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchState();
    })();
  }, [fetchState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(100, prev + 2));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasCooldowns = Object.values(skillCooldowns).some((value) => value > 0);
    if (!hasCooldowns) return;
    const interval = setInterval(() => {
      setSkillCooldowns((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const key of Object.keys(prev)) {
          const value = prev[key];
          const nextValue = Math.max(0, value - 1);
          if (nextValue !== value) changed = true;
          next[key] = nextValue;
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [skillCooldowns]);

  const pushLog = useCallback((message: string) => {
    setBattleLog((prev) => [message, ...prev].slice(0, 8));
  }, []);

  const handleDamage = useCallback(
    (payload: BossDamagePayload) => {
      if (!payload.damage) return;
      const burst: DamageBurst = {
        id: `${payload.damage}-${Date.now()}`,
        value: payload.damage,
        critical: payload.critical ?? payload.damage > 250,
      };
      setDamageBursts((prev) => [...prev, burst]);
      setTimeout(() => {
        setDamageBursts((prev) => prev.filter((item) => item.id !== burst.id));
      }, 1500);
      const bossName = state?.boss?.name ?? "The Boss";
      pushLog(`${payload.source} dealt ${payload.damage} damage`);
      if (payload.damage < 60) {
        pushLog(`${bossName} resisted the attack`);
      }
      setShake(true);
      setTimeout(() => setShake(false), 400);
      if (burst.critical) {
        setFlash(true);
        setTimeout(() => setFlash(false), 120);
      }
      if (payload.defeated) {
        setPhase("VICTORY");
        const loot = {
          exp: payload.rewards?.exp ?? 0,
          coins: payload.rewards?.coins ?? 0,
          itemName: payload.rewards?.itemName ?? null,
        };
        setVictory(loot);
        if (loot.itemName) {
          setShowLoot(loot);
        }
      } else {
        setTimeout(() => {
          setPhase("BOSS_COUNTER");
          setCounterVisible(true);
          pushLog(`${bossName} is preparing a counter`);
          setTimeout(() => {
            setCounterVisible(false);
            pushLog(`${bossName} retaliates!`);
            setPhase("COOLDOWN");
          }, 800);
        }, 600);
      }
    },
    [state, pushLog]
  );

  useEffect(() => {
    const unsubTasks = subscribeToTasksUpdate(() => {
      void fetchState();
    });
    const unsubDamage = subscribeToBossDamage((payload) => handleDamage(payload));
    return () => {
      unsubTasks();
      unsubDamage();
    };
  }, [fetchState, handleDamage]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { user: { profile?: { username?: string | null; title?: string | null; rank?: string | null; level?: number | null } | null; name?: string | null } | null };
      if (data.user) {
        setPlayer({
          username: data.user.profile?.username ?? data.user.name ?? "Hunter",
          title: data.user.profile?.title ?? null,
          rank: data.user.profile?.rank ?? null,
          level: data.user.profile?.level ?? null,
        });
      }
    })();
  }, []);

  const attackBoss = useCallback(
    (skill: SkillButton) => {
      if (pending || !state) return;
      if (state.cooldownRemainingMs > 0) {
        pushLog(`Cooldown active: ${formatMs(state.cooldownRemainingMs)}`);
        setPhase("COOLDOWN");
        return;
      }
      if (skillCooldowns[skill.id] && skillCooldowns[skill.id] > 0) {
        pushLog(`${skill.label} is recharging (${skillCooldowns[skill.id]}s)`);
        return;
      }
      if (energy < skill.energyCost) {
        pushLog("Not enough energy");
        return;
      }
      setActiveSkill(skill.id);
      setSlashVisible(true);
      setTimeout(() => setSlashVisible(false), 500);
      setPhase("PLAYER_ATTACK");
      pushLog(`You used ${skill.label}`);
      setEnergy((prev) => Math.max(0, prev - skill.energyCost));
      if (skill.cooldown) {
        setSkillCooldowns((prev) => ({
          ...prev,
          [skill.id]: skill.cooldown ?? 0,
        }));
      }
      void play("attack", 200);
      startTransition(() => {
        void (async () => {
          const res = await fetch("/api/boss/attack", { method: "POST" });
          if (!res.ok) {
            await fetchState();
            setPhase("COOLDOWN");
            setActiveSkill(null);
            return;
          }
          const data = (await res.json()) as BossBattleSummary;
          handleDamage({
            damage: data.damageApplied,
            source: skill.label,
            defeated: data.defeated,
            rewards: data.rewards
              ? { exp: data.rewards.exp, coins: data.rewards.coins, itemName: data.rewards.item?.name ?? null }
              : undefined,
          });
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  progress: data.progress,
                  cooldownRemainingMs: data.cooldownRemainingMs,
                  percentageRemaining: data.percentageRemaining,
                }
              : prev
          );
          setTimeout(() => {
            setPhase(data.defeated ? "VICTORY" : "COOLDOWN");
          }, 900);
          setActiveSkill(null);
          await fetchState();
        })();
      });
    },
    [pending, state, pushLog, fetchState, handleDamage, energy, skillCooldowns, play]
  );

  const boss = state?.boss ?? null;
  const progress = state?.progress ?? null;
  const cooldownRemainingMs = state?.cooldownRemainingMs ?? 0;
  const percentageRemaining = state?.percentageRemaining ?? 0;
  const phaseLabel = phase === "BOSS_HIT" ? "Player Hit" : phase.replace("_", " ");
  const monsterVisual = useMemo(() => {
    if (!boss) {
      return {
        aura: "from-rose-500/20 to-purple-500/10",
        sigil: "★",
      };
    }
    const variants = [
      { aura: "from-rose-600/40 to-amber-500/20", sigil: "ψ" },
      { aura: "from-fuchsia-600/40 to-indigo-500/20", sigil: "Ω" },
      { aura: "from-emerald-500/30 to-cyan-500/20", sigil: "§" },
    ];
    return variants[(monsterVariant - 1 + variants.length) % variants.length];
  }, [boss, monsterVariant]);
  const isOnCooldown = cooldownRemainingMs > 0;

  if (!state || !boss) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-white/70">
        <p>No active boss yet. Complete tasks to unlock boss encounters.</p>
      </div>
    );
  }

  const productivitySync = Math.max(0, Math.min(100, Math.round(productivityCompletion ?? 0)));

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#05020d] via-[#0f0c1f] to-[#05020d] p-6 text-white lg:p-8"
      animate={shake ? { x: [0, -8, 8, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      {flash && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#05020d]" />
      </div>
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-white/60">
          <div className="flex flex-wrap items-center gap-4">
            <span>Phase: {phaseLabel}</span>
            <span>Cooldown: {formatMs(cooldownRemainingMs)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold text-white/80">
            <span className="uppercase tracking-[0.3em] text-white/60">Productivity sync</span>
            <span className="text-white">{productivitySync}%</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <BossCard boss={boss} progress={progress} counterVisible={counterVisible} visual={monsterVisual} percentageRemaining={percentageRemaining ?? 0} />
            <div className="grid gap-4 sm:grid-cols-2">
              <PlayerCard player={player} phase={phase} />
              <ProductivityPanel energy={energy} completion={productivitySync} cooldownMs={cooldownRemainingMs} />
            </div>
          </div>
          <div className="space-y-4">
            <SkillBoard
              skills={skills}
              activeSkill={activeSkill}
              isOnCooldown={isOnCooldown}
              pending={pending}
              onUseSkill={(skill) => attackBoss(skill)}
              energy={energy}
              cooldowns={skillCooldowns}
            />
            <BattleLog entries={battleLog} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {slashVisible && <SlashEffect />}
        {counterVisible && <CounterEffect />}
        {damageBursts.map((burst) => (
          <DamageNumber key={burst.id} value={burst.value} critical={burst.critical} />
        ))}
      </AnimatePresence>

      {phase === "VICTORY" && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 text-4xl font-black text-emerald-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Victory Achieved
        </motion.div>
      )}

      <VictoryModal state={victory} onClose={() => setVictory(null)} />
      <LootModal state={showLoot} onClose={() => setShowLoot(null)} />
    </motion.section>
  );
}

function PlayerCard({ player, phase }: { player: PlayerInfo | null; phase: BattlePhase }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Hunter</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl border border-cyan-400/40 bg-cyan-500/10" />
        <div>
          <p className="text-lg font-semibold">{player?.username ?? "Hunter"}</p>
          <p className="text-sm text-white/70">{player?.title ?? "Initiate"}</p>
          <p className="text-xs text-white/50">Rank {player?.rank ?? "Bronze"} · Lv {player?.level ?? 1}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-white/50">Status: {phase.replace("_", " ")}</p>
    </div>
  );
}

function BossCard({
  boss,
  progress,
  counterVisible,
  visual,
  percentageRemaining,
}: {
  boss: BossBattleState["boss"];
  progress: BossBattleState["progress"];
  counterVisible: boolean;
  visual: { aura: string; sigil: string };
  percentageRemaining: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">Current Boss</p>
          <h3 className="text-2xl font-black text-white">{boss?.name}</h3>
          <p className="text-sm text-white/70">Weakness: {boss?.weakness ?? "Unknown"}</p>
          <p className="text-xs text-white/60">
            HP {formatter.format(progress?.currentHp ?? 0)} / {formatter.format(boss?.maxHp ?? 0)}
          </p>
        </div>
        <div className={`relative h-40 w-40 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br ${visual.aura}`}>
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.25), transparent 60%)" }} />
          <p className="relative z-10 flex h-full items-center justify-center text-6xl font-black text-white/80">
            {visual.sigil}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
          <span>Boss Pressure</span>
          <span>{percentageRemaining}% HP</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-amber-200"
            animate={{ width: `${percentageRemaining}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        {counterVisible && (
          <motion.div
            className="rounded-2xl border border-amber-400/40 bg-amber-200/10 px-3 py-2 text-xs text-amber-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Counter stance activated!
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ProductivityPanel({ energy, completion, cooldownMs }: { energy: number; completion: number; cooldownMs: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Productivity link</p>
      <div className="mt-3 space-y-3 text-sm text-white/80">
        <div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Focus energy</span>
            <span>{energy}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${energy}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Tasks completed</span>
            <span>{completion}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <p className="text-xs text-white/60">Next strike ready in {formatMs(cooldownMs)} once tasks fuel your energy.</p>
      </div>
    </div>
  );
}

function SkillBoard({
  skills,
  activeSkill,
  isOnCooldown,
  pending,
  onUseSkill,
  energy,
  cooldowns,
}: {
  skills: SkillButton[];
  activeSkill: string | null;
  isOnCooldown: boolean;
  pending: boolean;
  onUseSkill: (skill: SkillButton) => void;
  energy: number;
  cooldowns: Record<string, number>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Combat actions</p>
      <div className="mt-4 flex flex-col gap-3">
        {skills.map((skill) => {
          const cooldownRemaining = cooldowns[skill.id] ?? 0;
          const cooldownPercent = skill.cooldown
            ? Math.max(0, Math.min(100, Math.round(((skill.cooldown - cooldownRemaining) / skill.cooldown) * 100)))
            : 100;
          const disabled = pending || isOnCooldown || skill.disabled || energy < skill.energyCost || cooldownRemaining > 0;
          return (
            <button
              key={skill.id}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                disabled ? "border-white/10 text-white/40" : "border-cyan-400/40 hover:border-cyan-200/60"
              } ${activeSkill === skill.id ? "bg-cyan-500/10" : "bg-white/5"}`}
              disabled={disabled}
              onClick={() => onUseSkill(skill)}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{skill.label}</p>
                <p className="text-xs text-white/60">{skill.description}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] uppercase text-white/50">
                  {skill.cooldown && <span>CD {skill.cooldown}s</span>}
                  <span>Cost {skill.energyCost}</span>
                </div>
              </div>
              <div className="relative h-12 w-12">
                <div
                  className="absolute inset-0 rounded-full border border-white/20"
                  style={{
                    background: `conic-gradient(#22d3ee ${cooldownPercent}%, rgba(255,255,255,0.08) ${cooldownPercent}%)`,
                  }}
                />
                <div className="absolute inset-[4px] rounded-full bg-black/60 flex items-center justify-center text-[10px] font-semibold text-white">
                  {cooldownRemaining > 0 ? `${cooldownRemaining}s` : "Ready"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BattleLog({ entries }: { entries: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Battle log</p>
      <ul className="mt-3 space-y-1">
        {entries.length === 0 && <li className="text-white/40">Awaiting first strike...</li>}
        {entries.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function SlashEffect() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0], rotate: [0, -10, -10] }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-y-1/4 right-10 h-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
    </motion.div>
  );
}

function CounterEffect() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.05, 1] }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-rose-500/20 to-transparent" />
    </motion.div>
  );
}

function DamageNumber({ value, critical }: { value: number; critical?: boolean }) {
  return (
    <motion.span
      className={`pointer-events-none absolute right-16 top-24 text-3xl font-black ${critical ? "text-amber-300" : "text-rose-300"}`}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -40, scale: critical ? 1.4 : 1 }}
      exit={{ opacity: 0, y: -80, scale: 0.7 }}
    >
      -{value}
    </motion.span>
  );
}

function VictoryModal({ state, onClose }: { state: VictoryState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl border border-emerald-400/40 bg-[#04180f] p-6 text-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">Victory</p>
            <h4 className="mt-2 text-3xl font-black">Boss Defeated</h4>
            <p className="mt-4 text-sm text-white/80">Rewards secured.</p>
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              <li>+{state.exp.toLocaleString()} EXP</li>
              <li>+{state.coins.toLocaleString()} coins</li>
              {state.itemName && <li>Looted {state.itemName}</li>}
            </ul>
            <Button className="mt-6 w-full" onClick={onClose}>
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LootModal({ state, onClose }: { state: VictoryState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {state && state.itemName && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-3xl border border-yellow-400/50 bg-black/80 px-8 py-6 text-center text-yellow-200"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.4em]">Loot Drop</p>
            <h4 className="mt-2 text-2xl font-black">{state.itemName}</h4>
            <Button className="mt-4" onClick={onClose}>
              Claim
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
