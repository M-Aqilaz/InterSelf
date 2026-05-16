"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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

        push({
          title: "Task completed",
          description: `+${rewardExp} EXP · ${rewardCoins} coins`,
          variant: "success",
        });
        await refreshAll();
      });
    },
    [push, refreshAll]
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
        <Button size="sm" disabled={pending} onClick={() => completeTask(task)}>
          Complete
        </Button>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
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
        <div className="mt-6 space-y-6">
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
    </div>
  );
}
