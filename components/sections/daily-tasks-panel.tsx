"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { emitBossDamageEvent, emitTasksUpdatedEvent } from "@/lib/events";

const SYSTEM_TASKS = [
  {
    key: "solar-rise",
    title: "Solar Rise Protocol",
    subtitle: "Bangun pagi",
    matcher: ["solar rise protocol", "bangun pagi"],
    fallbackDescription:
      "Complete breathwork, hydration, and journaling within 20 minutes of waking.",
  },
  {
    key: "deep-work",
    title: "Deep Work Sprint",
    subtitle: "Sesi belajar",
    matcher: ["deep work sprint", "belajar"],
    fallbackDescription: "Ship 90 minutes of focused work with everything silenced.",
  },
  {
    key: "wealth-sync",
    title: "Wealth Sync Review",
    subtitle: "Menabung",
    matcher: ["wealth sync review", "menabung"],
    fallbackDescription: "Audit expenses, update your runway, and trigger a financial move.",
  },
];

type TaskStatReward = {
  id: number;
  stat: string;
  amount: number;
};

type TaskRecord = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  expReward: number;
  coinReward: number;
  streakImpact: number;
  isSystem: boolean;
  statRewards: TaskStatReward[];
  completedToday?: boolean;
};

type RewardBurst = {
  id: string;
  label: string;
  color: string;
  offset: number;
};

type RewardModalState = {
  taskName: string;
  exp: number;
  coins: number;
  stats: { label: string; value: number }[];
  bossDamage?: number;
};

type LevelModalState = {
  fromLevel: number;
  toLevel: number;
  newRank?: string | null;
  newTitle?: string | null;
};

type PlayerState = {
  level: number;
  rank: string | null;
  title: string | null;
};

const normalize = (value: string) => value.toLowerCase().trim();

const formatLabel = (label: string) =>
  label
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

const describeRewards = (task: TaskRecord) => {
  const rewardParts = [`+${task.expReward} EXP`, `${task.coinReward} coins`, `Streak +${task.streakImpact}`];
  if (task.statRewards?.length) {
    rewardParts.push(
      task.statRewards.map((reward) => `+${reward.amount} ${formatLabel(reward.stat)}`).join(", ")
    );
  }
  return rewardParts.join(" · ");
};

export function DailyTasksPanel() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();
  const [floatingRewards, setFloatingRewards] = useState<RewardBurst[]>([]);
  const [rewardModal, setRewardModal] = useState<RewardModalState | null>(null);
  const [levelModal, setLevelModal] = useState<LevelModalState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to load tasks");
      }
      const data = (await res.json()) as TaskRecord[];
      setTasks(data);
    } catch (err) {
      const message = (err as Error).message ?? "Failed to load tasks";
      setError(message);
      push({ title: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void (async () => {
      await fetchTasks();
    })();
  }, [fetchTasks]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { user: { profile?: { level: number; rank: string | null; title: string | null } | null } | null };
      if (data.user?.profile) {
        setPlayerState({
          level: data.user.profile.level,
          rank: data.user.profile.rank ?? null,
          title: data.user.profile.title ?? null,
        });
      }
    })();
  }, []);

  const systemMatches = useMemo(() => {
    return SYSTEM_TASKS.map((definition) => {
      const task = tasks.find((entry) => definition.matcher.some((match) => normalize(entry.title).includes(match)));
      return { definition, task };
    });
  }, [tasks]);

  const optionalTasks = useMemo(() => tasks.filter((task) => !task.isSystem), [tasks]);

  const refreshAll = useCallback(async () => {
    await fetchTasks();
    router.refresh();
  }, [fetchTasks, router]);

  const completeTask = useCallback(
    (task: TaskRecord) => {
      startTransition(async () => {
        const res = await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          push({ title: payload.error ?? "Unable to complete task", variant: "error" });
          return;
        }

        const rewardExp = payload?.completion?.expEarned ?? task.expReward;
        const rewardCoins = payload?.completion?.coinsEarned ?? task.coinReward;
        const statIncreases = Object.entries((payload?.completion?.statIncreases as Record<string, number>) ?? {});

        push({
          title: "Task completed",
          description: `+${rewardExp} EXP · ${rewardCoins} coins`,
          variant: "success",
        });
        const bursts: RewardBurst[] = [
          makeBurst(`+${rewardExp} EXP`, "text-cyan-300"),
          makeBurst(`+${rewardCoins} Coins`, "text-amber-200"),
        ];
        statIncreases.forEach(([stat, value]) => {
          if (!value) return;
          bursts.push(makeBurst(`+${value} ${formatLabel(stat)}`, "text-emerald-300"));
        });

        const bossDamage = payload?.bossBattle?.damageApplied ?? 0;
        if (bossDamage > 0) {
          bursts.push(makeBurst(`-${bossDamage} HP`, "text-rose-300"));
        }

        setFloatingRewards((prev) => [...prev, ...bursts]);
        setTimeout(() => {
          setFloatingRewards((prev) => prev.filter((burst) => !bursts.find((b) => b.id === burst.id)));
        }, 2000);

        setRewardModal({
          taskName: task.title,
          exp: rewardExp,
          coins: rewardCoins,
          stats: statIncreases.map(([label, value]) => ({ label: formatLabel(label), value })),
          bossDamage: bossDamage || undefined,
        });

        if (payload?.bossBattle) {
          emitBossDamageEvent({
            damage: payload.bossBattle.damageApplied,
            source: task.title,
            defeated: payload.bossBattle.defeated,
            rewards: payload.bossBattle.rewards
              ? {
                  exp: payload.bossBattle.rewards.exp,
                  coins: payload.bossBattle.rewards.coins,
                  itemName: payload.bossBattle.rewards.item?.name ?? null,
                }
              : null,
          });
        }

        if (payload?.levelProgress?.level) {
          const newLevel = payload.levelProgress.level;
          if (playerState && newLevel > playerState.level) {
            setLevelModal({
              fromLevel: playerState.level,
              toLevel: newLevel,
              newRank: payload.profile?.rank ?? null,
              newTitle: payload.profile?.title ?? null,
            });
          }
          setPlayerState({
            level: newLevel,
            rank: payload.profile?.rank ?? playerState?.rank ?? null,
            title: payload.profile?.title ?? playerState?.title ?? null,
          });
        }

        await refreshAll();
        emitTasksUpdatedEvent();
      });
    },
    [playerState, push, refreshAll]
  );

  const addOptionalTask = useCallback(() => {
    if (!formTitle.trim() || !formDescription.trim()) {
      push({ title: "Fill in title and description", variant: "error" });
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: "CUSTOM",
          difficulty: "MEDIUM",
          expReward: 80,
          coinReward: 25,
          streakImpact: 1,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({ title: payload.error ?? "Unable to create task", variant: "error" });
        return;
      }
      push({ title: "Optional task added", variant: "success" });
      setFormTitle("");
      setFormDescription("");
      await refreshAll();
      emitTasksUpdatedEvent();
    });
  }, [formDescription, formTitle, push, refreshAll]);

  const renderTask = (task?: TaskRecord | null) => {
    if (!task) {
      return <p className="text-xs text-white/50">Not available yet.</p>;
    }

    return (
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-white/60">
          {describeRewards(task)} · {formatLabel(task.category)} · {task.difficulty}
        </p>
        {task.completedToday ? (
          <span className="text-xs text-emerald-300">Completed today</span>
        ) : (
          <Button size="sm" disabled={pending} onClick={() => completeTask(task)}>
            Complete
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 to-[#0a0318] p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl" />
      </div>
      <AnimatePresence>
        {floatingRewards.map((burst) => (
          <motion.span
            key={burst.id}
            className={`pointer-events-none absolute text-sm font-semibold ${burst.color}`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -60 }}
            exit={{ opacity: 0, y: -90 }}
            style={{ right: `${burst.offset}%`, top: "20%" }}
          >
            {burst.label}
          </motion.span>
        ))}
      </AnimatePresence>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Daily Tasks</p>
          <h3 className="text-2xl font-black text-white">Mission Queue</h3>
        </div>
        <Button variant="ghost" size="sm" disabled={loading} onClick={fetchTasks}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading tasks...</p>
      ) : (
        <div className="relative mt-6 space-y-6">
          <section>
            <h4 className="text-xs uppercase tracking-[0.3em] text-white/50">System rituals</h4>
            <ul className="mt-3 space-y-4">
              {systemMatches.map(({ definition, task }) => (
                <li key={definition.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{definition.title}</p>
                      <p className="text-xs text-white/60">{definition.subtitle}</p>
                      <p className="mt-1 text-xs text-white/60">
                        {task?.description ?? definition.fallbackDescription}
                      </p>
                    </div>
                    {task && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase text-white/70">
                        {task.difficulty}
                      </span>
                    )}
                  </div>
                  {renderTask(task)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Add optional task</p>
              <div className="mt-3 flex flex-col gap-3">
                <input
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="Task title"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                />
                <textarea
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  rows={3}
                  placeholder="Describe the ritual or target"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                />
                <Button disabled={pending} onClick={addOptionalTask}>
                  Save optional task
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Extra quests</p>
              {optionalTasks.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No custom tasks yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {optionalTasks.map((task) => (
                    <li key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{task.title}</p>
                          <p className="text-xs text-white/60">{task.description}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase text-white/70">
                          {task.category}
                        </span>
                      </div>
                      {renderTask(task)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
      <RewardModal state={rewardModal} onClose={() => setRewardModal(null)} />
      <LevelUpModal state={levelModal} onClose={() => setLevelModal(null)} />
    </div>
  );
}

function makeBurst(label: string, color: string): RewardBurst {
  return {
    id: `${label}-${Date.now()}-${Math.random()}`,
    label,
    color,
    offset: Math.random() * 30,
  };
}

function RewardModal({ state, onClose }: { state: RewardModalState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#07030f] p-6 text-white shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Rewards</p>
            <h4 className="text-2xl font-black">{state.taskName}</h4>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>+{state.exp.toLocaleString()} EXP</p>
              <p>+{state.coins.toLocaleString()} coins</p>
              {state.stats.map((stat) => (
                <p key={stat.label}>+{stat.value} {stat.label}</p>
              ))}
              {state.bossDamage ? <p>Boss damage: {state.bossDamage}</p> : null}
            </div>
            <Button className="mt-6 w-full" onClick={onClose}>
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LevelUpModal({ state, onClose }: { state: LevelModalState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-br from-purple-900/80 to-black/80 p-8 text-center text-white"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Level Up</p>
            <h3 className="mt-2 text-4xl font-black">Level {state.fromLevel} → {state.toLevel}</h3>
            {state.newTitle && <p className="mt-2 text-lg text-white/80">New title unlocked: {state.newTitle}</p>}
            {state.newRank && <p className="text-white/60">Rank ascended to {state.newRank}</p>}
            <Button className="mt-6" onClick={onClose}>
              Ascend
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
