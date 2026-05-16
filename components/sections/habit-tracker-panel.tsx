"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { HabitProgressMap } from "@/types/productivity";

const HABIT_PROGRESS_KEY = "interself-habit-progress";

const readProgress = () => {
  if (typeof window === "undefined") return {} as HabitProgressMap;
  const stored = window.localStorage.getItem(HABIT_PROGRESS_KEY);
  if (!stored) return {} as HabitProgressMap;
  try {
    return JSON.parse(stored) as HabitProgressMap;
  } catch {
    return {} as HabitProgressMap;
  }
};

const HABITS = [
  { id: "journal", label: "Morning Journal", category: "Mind", cadence: "Daily" },
  { id: "move", label: "Mobility Flow", category: "Body", cadence: "Daily" },
  { id: "study", label: "Study Chapter", category: "Growth", cadence: "Daily" },
  { id: "finance", label: "Finance Check-in", category: "Wealth", cadence: "Weekly" },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type HabitSnapshot = {
  id: string;
  label: string;
  category: string;
  cadence: string;
  streak: number;
  completion: number;
};

export function HabitTrackerPanel() {
  const [progress, setProgress] = useState<HabitProgressMap>(() => readProgress());
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HABIT_PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event("interself-habit-sync"));
  }, [progress]);

  const toggleHabitForToday = (habitId: string) => {
    setProgress((prev) => {
      const existing = new Set(prev[habitId] ?? []);
      if (existing.has(todayKey)) existing.delete(todayKey);
      else existing.add(todayKey);
      return { ...prev, [habitId]: Array.from(existing) };
    });
  };

  const habitSnapshots = useMemo<HabitSnapshot[]>(() => {
    return HABITS.map((habit) => {
      const entries = new Set(progress[habit.id] ?? []);
      const pastWeek = [...Array(7)].map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        return entries.has(key);
      });
      const completion = Math.round((pastWeek.filter(Boolean).length / 7) * 100);
      let streak = 0;
      for (let offset = 0; offset < 30; offset += 1) {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        const key = date.toISOString().slice(0, 10);
        if (entries.has(key)) streak += 1;
        else break;
      }
      return {
        id: habit.id,
        label: habit.label,
        category: habit.category,
        cadence: habit.cadence,
        streak,
        completion,
      };
    });
  }, [progress]);

  const handleReset = () => {
    setProgress({});
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/75 via-[#0f0a1d] to-[#05030a] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Habit Tracker</p>
          <h3 className="text-2xl font-black">Ritual Matrix</h3>
          <p className="text-sm text-white/70">Mark your non-negotiables to grow streaks and unlock achievement milestones.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset week
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {habitSnapshots.map((habit) => (
          <div key={habit.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{habit.label}</p>
                <p className="text-xs text-white/60">{habit.category} · {habit.cadence}</p>
              </div>
              <div className="text-right text-xs text-white/60">
                <p>Streak {habit.streak}d</p>
                <p>{habit.completion}% weekly completion</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs">
              {DAY_LABELS.map((dayLabel, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                const key = date.toISOString().slice(0, 10);
                const completed = progress[habit.id]?.includes(key);
                const isToday = key === todayKey;
                return (
                  <button
                    key={`${habit.id}-${dayLabel}`}
                    type="button"
                    onClick={() => toggleHabitForToday(habit.id)}
                    disabled={!isToday}
                    className={`rounded-xl border px-2 py-2 ${
                      completed ? "border-emerald-400/60 bg-emerald-500/20" : "border-white/10 bg-white/5 text-white/50"
                    } ${isToday ? "cursor-pointer" : "cursor-default opacity-70"}`}
                  >
                    <p>{dayLabel}</p>
                    <p className="text-[10px] text-white/60">{isToday ? "Today" : ""}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                animate={{ width: `${habit.completion}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
