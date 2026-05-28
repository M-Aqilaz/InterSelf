"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { emitBossDamageEvent, emitTasksUpdatedEvent } from "@/lib/events";

type Task = { id: number; title: string; isSystem: boolean; durationMinutes?: number | null };
type Props = { tasks?: Task[]; completedTaskIds?: Set<number> };

// Quest icon mapping
const QUEST_ICONS: Record<string, { path: string; bg: string }> = {
  membaca:    { path: "M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 004 17V4.5A2.5 2.5 0 016.5 2H20v20H6.5", bg: "rgba(245,158,11,0.12)" },
  baca:       { path: "M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 004 17V4.5A2.5 2.5 0 016.5 2H20v20H6.5", bg: "rgba(245,158,11,0.12)" },
  neural:     { path: "M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 004 17V4.5A2.5 2.5 0 016.5 2H20v20H6.5", bg: "rgba(139,92,246,0.12)" },
  ekspansi:   { path: "M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 004 17V4.5A2.5 2.5 0 016.5 2H20v20H6.5", bg: "rgba(139,92,246,0.12)" },
  malam:      { path: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z", bg: "rgba(99,102,241,0.12)" },
  sistem:     { path: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z", bg: "rgba(99,102,241,0.12)" },
  kekayaan:   { path: "M12 1v22 M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H6", bg: "rgba(245,158,11,0.12)" },
  sinkron:    { path: "M12 1v22 M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H6", bg: "rgba(245,158,11,0.12)" },
  latihan:    { path: "M6.5 6.5h11 M17.5 6.5v11a1 1 0 01-1 1h-9a1 1 0 01-1-1v-11 M10 6.5V5a1 1 0 011-1h2a1 1 0 011 1v1.5", bg: "rgba(239,68,68,0.12)" },
  workout:    { path: "M6.5 6.5h11 M17.5 6.5v11a1 1 0 01-1 1h-9a1 1 0 01-1-1v-11 M10 6.5V5a1 1 0 011-1h2a1 1 0 011 1v1.5", bg: "rgba(239,68,68,0.12)" },
  mikro:      { path: "M6.5 6.5h11 M17.5 6.5v11a1 1 0 01-1 1h-9a1 1 0 01-1-1v-11 M10 6.5V5a1 1 0 011-1h2a1 1 0 011 1v1.5", bg: "rgba(239,68,68,0.12)" },
  bangkit:    { path: "M12 3v1 M12 20v1 M4.22 4.22l.707.707 M18.36 18.36l.707.707 M1 12h2 M21 12h-2 M4.22 19.78l.707-.707 M18.36 5.64l.707-.707", bg: "rgba(245,158,11,0.12)" },
  pagi:       { path: "M12 3v1 M12 20v1 M4.22 4.22l.707.707 M18.36 18.36l.707.707 M1 12h2 M21 12h-2 M4.22 19.78l.707-.707 M18.36 5.64l.707-.707", bg: "rgba(245,158,11,0.12)" },
  sprint:     { path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", bg: "rgba(99,102,241,0.12)" },
  kerja:      { path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", bg: "rgba(99,102,241,0.12)" },
};

function getQuestIcon(title: string): { path: string; bg: string } {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(QUEST_ICONS)) {
    if (lower.includes(key)) return val;
  }
  return { path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", bg: "rgba(139,92,246,0.12)" };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

type TimerState = {
  taskId: number;
  totalSeconds: number;
  remainingSeconds: number;
  running: boolean;
  completed: boolean;
};

const STREAKS = [7, 5, 3, 6, 2];
const REWARDS = [{ xp: 20, c: 10 }, { xp: 40, c: 20 }, { xp: 40, c: 20 }, { xp: 20, c: 10 }, { xp: 30, c: 15 }];

export function DailyQuestsPanel({ tasks = [], completedTaskIds = new Set() }: Props) {
  const [done, setDone] = useState<Set<number>>(completedTaskIds);
  const [timers, setTimers] = useState<Record<number, TimerState>>({});
  const [pending, start] = useTransition();
  const { push } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setDone(completedTaskIds); }, [completedTaskIds]);

  // Global timer tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        let changed = false;
        for (const id in next) {
          const t = next[id]!;
          if (t.running && t.remainingSeconds > 0) {
            next[id] = { ...t, remainingSeconds: t.remainingSeconds - 1 };
            changed = true;
          } else if (t.running && t.remainingSeconds === 0) {
            next[id] = { ...t, running: false, completed: true };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTimer = useCallback((taskId: number, durationMinutes: number) => {
    const totalSeconds = durationMinutes * 60;
    setTimers(prev => ({
      ...prev,
      [taskId]: { taskId, totalSeconds, remainingSeconds: totalSeconds, running: true, completed: false },
    }));
  }, []);

  const pauseTimer = useCallback((taskId: number) => {
    setTimers(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId]!, running: !prev[taskId]!.running },
    }));
  }, []);

  const completeTask = useCallback((taskId: number) => {
    if (done.has(taskId) || taskId < 0) return;
    start(async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
        if (!res.ok) throw new Error();
        setDone(p => new Set([...p, taskId]));
        setTimers(prev => { const n = { ...prev }; delete n[taskId]; return n; });
        emitTasksUpdatedEvent();
        emitBossDamageEvent({ damage: 500, source: "Daily quest" });
        push({ title: "Quest selesai!", variant: "success" });
      } catch {
        push({ title: "Gagal menyelesaikan quest", variant: "error" });
      }
    });
  }, [done, push]);

  const displayTasks = tasks.length > 0 ? tasks.slice(0, 5) : [
    { id: -1, title: "Sesi Membaca Harian", isSystem: true, durationMinutes: 30 },
    { id: -2, title: "Blok Ekspansi Neural", isSystem: true, durationMinutes: 60 },
    { id: -3, title: "Pemeriksaan Sistem Malam", isSystem: true, durationMinutes: 15 },
    { id: -4, title: "Tinjauan Sinkronisasi Kekayaan", isSystem: true, durationMinutes: 20 },
    { id: -5, title: "Latihan Mikro Intensif", isSystem: true, durationMinutes: 45 },
  ];

  const isFallback = tasks.length === 0;
  const FALLBACK_DONE = new Set([-1, -2, -3, -4]);
  const completedSet = isFallback ? FALLBACK_DONE : done;
  const completedCount = isFallback ? 4 : done.size;
  const total = displayTasks.length;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "#0c1018" }}>

      {/* TODAY'S QUEST badge */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", background: "#fff", color: "#111", fontFamily: "monospace", fontSize: 9, fontWeight: 900, padding: "4px 14px", borderRadius: "0 0 10px 10px", letterSpacing: "0.1em", whiteSpace: "nowrap", zIndex: 10 }}>
        TODAY&apos;S QUEST
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 16px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f87171" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Daily Quests</span>
        </div>
      </div>

      {/* Bonus banner */}
      <div style={{ margin: "0 12px 10px", background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 8, padding: "5px 10px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, color: "#22d3ee" }}>Complete all for bonus!</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#22d3ee" }}>+150 XP &nbsp; +50 Coins</span>
      </div>

      {/* Quest list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 10px 10px" }}>
        {displayTasks.map((task, idx) => {
          const isDone = completedSet.has(task.id);
          const icon = getQuestIcon(task.title);
          const streak = STREAKS[idx] ?? 1;
          const reward = REWARDS[idx] ?? { xp: 20, c: 10 };
          const hasDuration = task.durationMinutes && task.durationMinutes > 0;
          const timer = timers[task.id];
          const timerRunning = timer?.running;
          const timerCompleted = timer?.completed;
          const timerPct = timer ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100 : 0;
          return (
            <div key={task.id} style={{ display: "flex", flexDirection: "column", background: "#111520", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden", opacity: isDone ? 0.75 : 1 }}>
              {/* Main row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px" }}>
                {/* Icon */}
                <div style={{ width: 34, height: 34, flexShrink: 0, background: icon.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon.path}/>
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                  {hasDuration && !isDone && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                      {timerCompleted ? "Siap diselesaikan!" : timer ? `${formatTime(timer.remainingSeconds)} tersisa` : `${task.durationMinutes} menit`}
                    </div>
                  )}
                </div>

                {/* Rewards */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: "#a78bfa" }}>+{reward.xp} XP</span>
                  <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>+{reward.c}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: "#f87171" }}>{streak}d</span>
                </div>

                {/* Action button */}
                {isDone ? (
                  <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, background: "rgba(139,92,246,0.35)", border: "1px solid rgba(139,92,246,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ) : hasDuration && !timerCompleted ? (
                  <button type="button"
                    onClick={() => timer ? pauseTimer(task.id) : startTimer(task.id, task.durationMinutes!)}
                    style={{ flexShrink: 0, background: timerRunning ? "rgba(239,68,68,0.2)" : "rgba(34,211,238,0.15)", border: `1px solid ${timerRunning ? "rgba(239,68,68,0.4)" : "rgba(34,211,238,0.3)"}`, borderRadius: 8, padding: "5px 10px", fontSize: 9, fontWeight: 700, color: timerRunning ? "#f87171" : "#22d3ee", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {timerRunning ? "Pause" : timer ? "Lanjut" : "Mulai"}
                  </button>
                ) : (
                  <button type="button" disabled={pending || task.id < 0}
                    onClick={() => completeTask(task.id)}
                    style={{ flexShrink: 0, background: "rgba(58,170,122,0.2)", border: "1px solid rgba(58,170,122,0.4)", borderRadius: 8, padding: "5px 10px", fontSize: 9, fontWeight: 700, color: "#3aaa7a", cursor: "pointer" }}>
                    Selesai
                  </button>
                )}
              </div>

              {/* Timer progress bar */}
              {hasDuration && timer && !isDone && (
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", width: "100%" }}>
                  <div style={{
                    height: "100%",
                    width: `${timerPct}%`,
                    background: timerCompleted ? "#3aaa7a" : timerRunning ? "#22d3ee" : "#f59e0b",
                    transition: "width 1s linear, background 0.3s",
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div style={{ padding: "0 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
          <span>Daily Progress</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {completedCount} / {total}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M8 21h8 M12 17v4 M7 4H4.5a2.5 2.5 0 000 5H7 M17 4h2.5a2.5 2.5 0 010 5H17 M7 4h10v8a5 5 0 01-10 0V4z"/></svg>
          </span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${isFallback ? 80 : total > 0 ? Math.round((completedCount / total) * 100) : 0}%`, background: "linear-gradient(90deg,#10b981,#3aaa7a)", borderRadius: 3, transition: "width 0.7s" }} />
        </div>
      </div>
    </div>
  );
}
