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

const QUEST_META: Record<string, { icon: string; desc: string; iconBg: string }> = {
  "meditate":        { icon: "🧘", desc: "Calm your mind.",         iconBg: "rgba(34,211,238,0.12)" },
  "study":           { icon: "📚", desc: "Level up your knowledge.", iconBg: "rgba(139,92,246,0.12)" },
  "workout":         { icon: "�", desc: "Train your body.",         iconBg: "rgba(239,68,68,0.12)"  },
  "micro-compound":  { icon: "�", desc: "Train your body.",         iconBg: "rgba(239,68,68,0.12)"  },
  "read":            { icon: "�", desc: "Feed your mind.",          iconBg: "rgba(245,158,11,0.12)" },
  "neural":          { icon: "�", desc: "Feed your mind.",          iconBg: "rgba(245,158,11,0.12)" },
  "doomscroll":      { icon: "�", desc: "Protect your time.",       iconBg: "rgba(239,68,68,0.08)"  },
  "no doomscroll":   { icon: "�", desc: "Protect your time.",       iconBg: "rgba(239,68,68,0.08)"  },
  "solar":           { icon: "☀️", desc: "Activate your morning.",   iconBg: "rgba(245,158,11,0.12)" },
  "wealth":          { icon: "💰", desc: "Check your finances.",     iconBg: "rgba(245,158,11,0.12)" },
  "nightly":         { icon: "🌙", desc: "Close out your day.",      iconBg: "rgba(99,102,241,0.12)" },
  "deep work":       { icon: "💻", desc: "Focus sprint.",            iconBg: "rgba(99,102,241,0.12)" },
};

function getQuestMeta(title: string) {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(QUEST_META)) {
    if (lower.includes(key)) return val;
  }
  return { icon: "⭐", desc: "Complete this quest.", iconBg: "rgba(139,92,246,0.12)" };
}

// Hardcoded 5 quests persis seperti mockup sebagai fallback
const MOCKUP_QUESTS: Task[] = [
  { id: -1, title: "Meditate 10 minutes", isSystem: true },
  { id: -2, title: "Study 1 hour",        isSystem: true },
  { id: -3, title: "Workout",             isSystem: true },
  { id: -4, title: "Read 20 pages",       isSystem: true },
  { id: -5, title: "No Doomscrolling",    isSystem: true },
];

const MOCKUP_DONE = new Set([-1, -2, -3, -4]);

export function DailyQuestsPanel({
  tasks = [],
  completedTaskIds = new Set(),
}: DailyQuestsPanelProps) {
  const [localCompleted, setLocalCompleted] = useState<Set<number>>(completedTaskIds);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  useEffect(() => {
    setLocalCompleted(completedTaskIds);
  }, [completedTaskIds]);

  const toggleTask = useCallback(
    (taskId: number, isDone: boolean) => {
      if (isDone || taskId < 0) return;
      startTransition(async () => {
        try {
          const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
          if (!res.ok) throw new Error("Failed");
          setLocalCompleted((prev) => new Set([...prev, taskId]));
          emitTasksUpdatedEvent();
          emitBossDamageEvent({ damage: 500 });
          push({ title: "Quest complete! ✓", variant: "success" });
        } catch {
          push({ title: "Failed to complete quest", variant: "error" });
        }
      });
    },
    [push]
  );

  // Pakai data real kalau ada, fallback ke 5 quests mockup
  const displayTasks = tasks.length > 0 ? tasks.slice(0, 5) : MOCKUP_QUESTS;
  const isUsingFallback = tasks.length === 0;

  const completedSet = isUsingFallback ? MOCKUP_DONE : localCompleted;
  const completedCount = isUsingFallback ? 4 : localCompleted.size;
  const totalCount = displayTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Streak values per quest (descending dari 7)
  const streaks = [7, 5, 3, 6, 2];

  // XP/Coins per quest
  const rewards = [
    { xp: 20, coins: 10 },
    { xp: 40, coins: 20 },
    { xp: 40, coins: 20 },
    { xp: 20, coins: 10 },
    { xp: 30, coins: 15 },
  ];

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border"
      style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* TODAY'S QUEST badge — persis mockup */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg px-4 py-[3px] font-mono text-[9px] font-black uppercase tracking-[0.12em] text-black"
        style={{ background: "#ffffff", whiteSpace: "nowrap" }}
      >
        TODAY&apos;S QUEST
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-7">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>🚩</span>
          <span>Daily Quests</span>
        </div>
        {/* Complete all bonus */}
        <div
          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
          style={{
            background: "rgba(34,211,238,0.05)",
            borderColor: "rgba(34,211,238,0.15)",
            color: "#22d3ee",
          }}
        >
          Complete all for bonus!
        </div>
      </div>

      {/* Bonus reward banner */}
      <div
        className="mx-4 mb-3 flex items-center justify-end gap-2 rounded-lg border px-3 py-[4px]"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span className="text-[9px] font-bold" style={{ color: "#a78bfa" }}>🎁 +150 XP</span>
        <span className="text-[9px] font-bold" style={{ color: "#f59e0b" }}>🪙 +50 Coins</span>
      </div>

      {/* Quest items */}
      <div className="flex flex-col gap-[5px] px-3 pb-3">
        {displayTasks.map((task, idx) => {
          const isDone = completedSet.has(task.id);
          const meta = getQuestMeta(task.title);
          const streak = streaks[idx] ?? 1;
          const reward = rewards[idx] ?? { xp: 20, coins: 10 };

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-[9px] transition",
                isDone ? "opacity-80" : "hover:border-white/15"
              )}
              style={{
                background: "#111520",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              {/* Quest icon */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ background: meta.iconBg }}
              >
                {meta.icon}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold text-white">{task.title}</div>
                <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {meta.desc}
                </div>
              </div>

              {/* Rewards */}
              <div className="flex shrink-0 items-center gap-[5px]">
                <span className="font-mono text-[9px] font-bold" style={{ color: "#a78bfa" }}>
                  +{reward.xp} XP
                </span>
                <span className="font-mono text-[9px] font-bold" style={{ color: "#f59e0b" }}>
                  🪙+{reward.coins}
                </span>
                <span className="font-mono text-[9px]" style={{ color: "#f87171" }}>
                  Streak {streak}🔥
                </span>
              </div>

              {/* Checkbox */}
              <button
                type="button"
                disabled={isDone || pending || task.id < 0}
                onClick={() => toggleTask(task.id, isDone)}
                className="ml-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border transition"
                style={
                  isDone
                    ? {
                        background: "rgba(139,92,246,0.35)",
                        borderColor: "rgba(139,92,246,0.6)",
                        color: "#c4b5fd",
                        fontSize: 11,
                      }
                    : {
                        background: "#161c2a",
                        borderColor: "rgba(255,255,255,0.12)",
                      }
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
        <div
          className="mb-1 flex items-center justify-between text-[10px]"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <span>Daily Progress</span>
          <span className="flex items-center gap-1">
            {completedCount} / {totalCount}
            <span className="text-lg">🏆</span>
          </span>
        </div>
        <div
          className="h-[5px] overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${isUsingFallback ? 80 : progressPct}%`,
              background: "linear-gradient(90deg, #10b981, #3aaa7a)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
