"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { emitBossDamageEvent, emitTasksUpdatedEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

type Task = {
  id: number;
  title: string;
  isSystem: boolean;
};

type DailyQuestsPanelProps = {
  tasks?: Task[];
  completedTaskIds?: Set<number>;
};

const QUEST_ICONS: Record<string, string> = {
  "Solar Rise Protocol": "🧘",
  "Meditate": "🧘",
  "Deep Work Sprint": "💻",
  "Study": "📚",
  "Micro-Compound Workout": "💪",
  "Workout": "💪",
  "Wealth Sync Review": "💰",
  "Nightly Systems Check": "🌙",
  "Neural Expansion Block": "📖",
  "Reading": "📖",
  "No Doomscrolling": "🚫",
};

const QUEST_ICON_COLORS: Record<string, string> = {
  "🧘": "rgba(34,211,238,0.1)",
  "💻": "rgba(99,102,241,0.1)",
  "📚": "rgba(139,92,246,0.1)",
  "💪": "rgba(239,68,68,0.1)",
  "💰": "rgba(245,158,11,0.1)",
  "🌙": "rgba(99,102,241,0.1)",
  "📖": "rgba(245,158,11,0.1)",
  "🚫": "rgba(239,68,68,0.08)",
  "⭐": "rgba(139,92,246,0.1)",
};

function getQuestIcon(title: string): string {
  for (const [key, icon] of Object.entries(QUEST_ICONS)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "⭐";
}

function getXP(isSystem: boolean): number {
  return isSystem ? 40 : 20;
}
function getCoins(isSystem: boolean): number {
  return isSystem ? 20 : 10;
}

export function DailyQuestsPanel({ tasks = [], completedTaskIds = new Set() }: DailyQuestsPanelProps) {
  const [localCompleted, setLocalCompleted] = useState<Set<number>>(completedTaskIds);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  useEffect(() => {
    setLocalCompleted(completedTaskIds);
  }, [completedTaskIds]);

  const toggleTask = useCallback(
    (taskId: number, currentlyDone: boolean) => {
      if (currentlyDone) return; // can't un-complete
      startTransition(async () => {
        try {
          const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
          if (!res.ok) throw new Error("Failed");
          setLocalCompleted((prev) => new Set([...prev, taskId]));
          emitTasksUpdatedEvent();
          emitBossDamageEvent({ damage: getXP(tasks.find((t) => t.id === taskId)?.isSystem ?? false) * 10 });
          push({ title: "Quest complete! ✓", variant: "success" });
        } catch {
          push({ title: "Failed to complete quest", variant: "error" });
        }
      });
    },
    [tasks, push]
  );

  const totalTasks = tasks.length;
  const completedCount = localCompleted.size;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Fallback display tasks when no real data
  const displayTasks =
    tasks.length > 0
      ? tasks
      : [
          { id: -1, title: "Meditate 10 minutes", isSystem: true },
          { id: -2, title: "Study 1 hour", isSystem: true },
          { id: -3, title: "Workout", isSystem: true },
          { id: -4, title: "Read 20 pages", isSystem: true },
          { id: -5, title: "No Doomscrolling", isSystem: true },
        ];

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border"
      style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* TODAY'S QUEST badge */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg px-3 py-[3px] font-mono text-[9px] font-black uppercase tracking-[0.15em] text-black"
        style={{ background: "#ffffff" }}
      >
        TODAY&apos;S QUEST
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-7">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>🚩</span>
          <span>Daily Quests</span>
        </div>
      </div>

      {/* Bonus banner */}
      <div
        className="mx-4 mb-3 flex items-center justify-between rounded-lg border px-3 py-[5px] text-[10px]"
        style={{
          background: "rgba(34,211,238,0.05)",
          borderColor: "rgba(34,211,238,0.15)",
          color: "#22d3ee",
        }}
      >
        <span>Complete all for bonus!</span>
        <span className="font-bold">🎁 +150 XP &nbsp;🪙 +50 Coins</span>
      </div>

      {/* Quest list */}
      <div className="flex flex-col gap-[6px] px-3 pb-3">
        {displayTasks.map((task, idx) => {
          const isDone = localCompleted.has(task.id) || (tasks.length === 0 && idx < 4);
          const icon = getQuestIcon(task.title);
          const iconBg = QUEST_ICON_COLORS[icon] ?? "rgba(139,92,246,0.1)";
          const xp = getXP(task.isSystem);
          const coins = getCoins(task.isSystem);
          const streak = Math.max(2, 7 - idx);

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 transition",
                isDone ? "opacity-90" : "hover:border-white/15"
              )}
              style={{
                background: "#111520",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              {/* Icon */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                style={{ background: iconBg }}
              >
                {icon}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold text-white">{task.title}</div>
                <div className="text-[9px] text-white/40">
                  {task.isSystem ? "System quest" : "Personal quest"}
                </div>
              </div>

              {/* Rewards */}
              <div className="flex shrink-0 items-center gap-[6px] font-mono text-[9px]">
                <span className="font-bold" style={{ color: "#a78bfa" }}>+{xp} XP</span>
                <span className="font-bold" style={{ color: "#f59e0b" }}>🪙+{coins}</span>
                <span style={{ color: "#e05a6a" }}>Streak {streak}🔥</span>
              </div>

              {/* Checkbox */}
              <button
                type="button"
                disabled={isDone || pending || task.id < 0}
                onClick={() => toggleTask(task.id, isDone)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] transition"
                style={
                  isDone
                    ? { background: "rgba(139,92,246,0.3)", borderColor: "rgba(139,92,246,0.5)", color: "#c4b5fd" }
                    : { background: "#161c2a", borderColor: "rgba(255,255,255,0.12)" }
                }
              >
                {isDone && "✓"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Daily Progress */}
      <div className="px-4 pb-4">
        <div className="mb-1 flex items-center justify-between text-[10px] text-white/50">
          <span>Daily Progress</span>
          <span className="flex items-center gap-1">
            {completedCount} / {totalTasks || 5}
            <span className="text-base">🏆</span>
          </span>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalTasks > 0 ? progressPercent : 80}%`,
              background: "linear-gradient(90deg, #10b981, #3aaa7a)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
