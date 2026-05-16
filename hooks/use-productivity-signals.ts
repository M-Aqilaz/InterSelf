"use client";

import { useEffect, useMemo, useState } from "react";
import type { FocusSession, HabitProgressMap, TaskSummary, FocusTrendPoint, HabitScoreSnapshot } from "@/types/productivity";

const FOCUS_HISTORY_KEY = "interself-focus-history";
const HABIT_PROGRESS_KEY = "interself-habit-progress";

const DEFAULT_TASK_SUMMARY: TaskSummary = { total: 0, completed: 0, byCategory: {} };

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  return safeParse(value, fallback);
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildTaskSummary(tasks: { category: string; completedToday?: boolean }[]): TaskSummary {
  if (!tasks.length) return DEFAULT_TASK_SUMMARY;
  return tasks.reduce<TaskSummary>(
    (acc, task) => {
      acc.total += 1;
      const category = task.category ?? "GENERAL";
      if (!acc.byCategory[category]) {
        acc.byCategory[category] = { total: 0, completed: 0 };
      }
      acc.byCategory[category].total += 1;
      if (task.completedToday) {
        acc.completed += 1;
        acc.byCategory[category].completed += 1;
      }
      return acc;
    },
    { total: 0, completed: 0, byCategory: {} }
  );
}

function computeFocusTrend(history: FocusSession[]): FocusTrendPoint[] {
  const days: FocusTrendPoint[] = [];
  for (let index = 6; index >= 0; index -= 1) {
    const target = new Date();
    target.setDate(target.getDate() - index);
    const key = target.toISOString().slice(0, 10);
    const minutes = history
      .filter((session) => session.completedAt.slice(0, 10) === key)
      .reduce((acc, session) => acc + session.duration, 0);
    days.push({ dayLabel: target.toLocaleDateString(undefined, { weekday: "short" }), minutes });
  }
  return days;
}

function computeHabitScore(progress: HabitProgressMap): HabitScoreSnapshot {
  const habitIds = Object.keys(progress);
  if (habitIds.length === 0) return { completion: 0 };
  const today = new Date();
  const completionRatios = habitIds.map((id) => {
    const entries = new Set(progress[id]);
    let completed = 0;
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - day);
      if (entries.has(date.toISOString().slice(0, 10))) {
        completed += 1;
      }
    }
    return { id, ratio: completed / 7 };
  });
  completionRatios.sort((a, b) => b.ratio - a.ratio);
  const strongest = completionRatios[0];
  const weakest = completionRatios[completionRatios.length - 1];
  const avg = completionRatios.reduce((acc, entry) => acc + entry.ratio, 0) / completionRatios.length;
  return {
    completion: Math.round(avg * 100),
    strongest: strongest?.ratio ? strongest.id : undefined,
    weakest: weakest?.ratio ? weakest.id : undefined,
  };
}

export function useProductivitySignals() {
  const [taskSummary, setTaskSummary] = useState<TaskSummary>(DEFAULT_TASK_SUMMARY);
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>(() => readStorage(FOCUS_HISTORY_KEY, []));
  const [habitProgress, setHabitProgress] = useState<HabitProgressMap>(() => readStorage(HABIT_PROGRESS_KEY, {}));

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/tasks", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { category: string; completedToday?: boolean }[];
        setTaskSummary(buildTaskSummary(data));
      } catch {
        // ignore fetch failure for analytics
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleFocusSync = () => {
      setFocusHistory(readStorage(FOCUS_HISTORY_KEY, []));
    };
    const handleHabitSync = () => {
      setHabitProgress(readStorage(HABIT_PROGRESS_KEY, {}));
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === FOCUS_HISTORY_KEY) {
        handleFocusSync();
      }
      if (event.key === HABIT_PROGRESS_KEY) {
        handleHabitSync();
      }
    };
    window.addEventListener("interself-focus-sync", handleFocusSync);
    window.addEventListener("interself-habit-sync", handleHabitSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("interself-focus-sync", handleFocusSync);
      window.removeEventListener("interself-habit-sync", handleHabitSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const focusTrend = useMemo(() => computeFocusTrend(focusHistory), [focusHistory]);
  const habitScore = useMemo(() => computeHabitScore(habitProgress), [habitProgress]);

  return { taskSummary, focusTrend, habitScore };
}
