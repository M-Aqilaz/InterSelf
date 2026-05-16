"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { BossBattleState, BossBattleSummary } from "@/types/boss";
import { subscribeToTasksUpdate, subscribeToBossDamage, BossDamagePayload } from "@/lib/events";

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

export function BossBattlePanel() {
  const [state, setState] = useState<BossBattleState | null>(null);
  const [pending, startTransition] = useTransition();
  const [damageBursts, setDamageBursts] = useState<DamageBurst[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [victory, setVictory] = useState<VictoryState | null>(null);
  const [showLoot, setShowLoot] = useState<VictoryState | null>(null);

  async function fetchState() {
    const res = await fetch("/api/boss/state");
    if (!res.ok) return;
    const data = (await res.json()) as BossBattleState;
    setState(data);
  }

  function handleDamage(payload: BossDamagePayload) {
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
    setBattleLog((prev) => [`${payload.source} dealt ${payload.damage} dmg`, ...prev].slice(0, 5));
    setShake(true);
    setTimeout(() => setShake(false), 400);
    if (payload.defeated) {
      const loot = {
        exp: payload.rewards?.exp ?? 0,
        coins: payload.rewards?.coins ?? 0,
        itemName: payload.rewards?.itemName ?? null,
      };
      setVictory(loot);
      if (loot.itemName) {
        setShowLoot(loot);
      }
    }
  }

  async function attackBoss() {
    startTransition(async () => {
      const res = await fetch("/api/boss/attack", { method: "POST" });
      if (!res.ok) {
        await fetchState();
        return;
      }
      const data = (await res.json()) as BossBattleSummary;
      handleDamage({
        damage: data.damageApplied,
        source: "Manual Strike",
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
      await fetchState();
    });
  }

  useEffect(() => {
    (async () => {
      await fetchState();
    })();
  }, []);

  useEffect(() => {
    const unsubTasks = subscribeToTasksUpdate(() => {
      void fetchState();
    });
    const unsubDamage = subscribeToBossDamage((payload) => handleDamage(payload));
    return () => {
      unsubTasks();
      unsubDamage();
    };
  }, []);

  if (!state || !state.boss) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
        <p>No active boss yet. Complete tasks to unlock boss encounters.</p>
      </div>
    );
  }

  const { boss, progress, cooldownRemainingMs, percentageRemaining } = state;

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07030f] p-6 text-white"
      animate={shake ? { x: [0, -8, 8, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-0 h-56 w-56 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-start gap-6">
          <motion.div className="relative h-24 w-24 rounded-3xl border border-white/20 bg-black/50">
            <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-purple-500/50 to-black/70" />
            <p className="relative z-10 flex h-full items-center justify-center text-4xl font-black text-white/80">
              {boss.name.slice(0, 1)}
            </p>
          </motion.div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Boss Arena</p>
            <h3 className="text-3xl font-black">{boss.name}</h3>
            <p className="text-sm text-white/70">{boss.description}</p>
          </div>
          <div className="text-right text-sm text-white/70">
            <p>Reward: {formatter.format(boss.rewardExp)} EXP · {formatter.format(boss.rewardCoins)} coins</p>
            {boss.rewardItem && <p>Loot: {boss.rewardItem.name}</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
            <span>HP</span>
            <span>
              {formatter.format(progress?.currentHp ?? 0)} / {formatter.format(boss.maxHp)}
            </span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-amber-400"
              animate={{ width: `${percentageRemaining ?? 0}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/60">
            <span>Weakness: {boss.weakness ?? "None"}</span>
            <span>Cooldown: {formatMs(cooldownRemainingMs)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <Button className="flex-1" disabled={pending || cooldownRemainingMs > 0} onClick={attackBoss}>
            {pending ? "Processing..." : cooldownRemainingMs > 0 ? "Cooldown active" : "Strike the boss"}
          </Button>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Battle Log</p>
            <ul className="mt-2 space-y-1">
              {battleLog.length === 0 && <li className="text-white/40">Awaiting first strike...</li>}
              {battleLog.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>

        <AnimatePresence>
          {damageBursts.map((burst) => (
            <motion.span
              key={burst.id}
              className={`pointer-events-none absolute right-16 top-24 text-3xl font-black ${burst.critical ? "text-amber-300" : "text-rose-300"}`}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: burst.critical ? 1.4 : 1 }}
              exit={{ opacity: 0, y: -80, scale: 0.7 }}
            >
              -{burst.value}
            </motion.span>
          ))}
        </AnimatePresence>

        <VictoryModal state={victory} onClose={() => setVictory(null)} />
        <LootModal state={showLoot} onClose={() => setShowLoot(null)} />
      </div>
    </motion.div>
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
