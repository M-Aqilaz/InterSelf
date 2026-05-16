"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { BarMeter } from "@/components/ui/meters";
import type { BossBattleState, BossBattleSummary } from "@/types/boss";
import { subscribeToTasksUpdate } from "@/lib/events";

const formatter = new Intl.NumberFormat();

function formatMs(ms: number) {
  if (ms <= 0) return "Ready";
  const seconds = Math.ceil(ms / 1000);
  return `${seconds}s`;
}

export function BossBattlePanel() {
  const [state, setState] = useState<BossBattleState | null>(null);
  const [summary, setSummary] = useState<BossBattleSummary | null>(null);
  const [pending, startTransition] = useTransition();

  async function fetchState() {
    const res = await fetch("/api/boss/state");
    if (!res.ok) return;
    const data = (await res.json()) as BossBattleState;
    setState(data);
  }

  async function attackBoss() {
    startTransition(async () => {
      const res = await fetch("/api/boss/attack", { method: "POST" });
      if (!res.ok) {
        await fetchState();
        return;
      }
      const data = (await res.json()) as BossBattleSummary;
      setSummary(data);
      await fetchState();
    });
  }

  useEffect(() => {
    (async () => {
      await fetchState();
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTasksUpdate(() => {
      void fetchState();
    });
    return unsubscribe;
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
    <div className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-black/60 to-white/5 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/60">Active Boss</p>
          <h3 className="text-2xl font-black text-white">{boss.name}</h3>
          <p className="text-sm text-white/70">{boss.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-white/60">Reward</p>
          <p className="text-lg font-semibold">
            {formatter.format(boss.rewardExp)} EXP · {formatter.format(boss.rewardCoins)} coins
          </p>
          {boss.rewardItem && <p className="text-xs text-white/60">Item: {boss.rewardItem.name}</p>}
        </div>
      </div>
      <BarMeter label="Boss HP" value={percentageRemaining ?? 0} />
      <p className="text-xs text-white/50">
        {formatter.format(progress?.currentHp ?? 0)} hp remaining of {formatter.format(boss.maxHp)}
      </p>
      <div className="flex items-center justify-between text-sm text-white/70">
        <p>Weakness: {boss.weakness ?? "None"}</p>
        <p>Cooldown: {formatMs(cooldownRemainingMs)}</p>
      </div>
      <Button className="w-full" disabled={pending || cooldownRemainingMs > 0} onClick={attackBoss}>
        {pending ? "Processing..." : cooldownRemainingMs > 0 ? "Cooldown active" : "Strike the boss"}
      </Button>
      {summary && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p>
            Last strike dealt <strong>{formatter.format(summary.damageApplied)}</strong> damage.
          </p>
          {summary.defeated ? (
            <p className="text-emerald-300">
              Boss defeated! Rewards: +{formatter.format(summary.rewards?.exp ?? 0)} EXP ·
              {" "}
              {formatter.format(summary.rewards?.coins ?? 0)} coins
              {summary.rewards?.item ? ` · ${summary.rewards.item.name}` : ""}
            </p>
          ) : (
            <p>{summary.percentageRemaining}% HP remains.</p>
          )}
        </div>
      )}
    </div>
  );
}
