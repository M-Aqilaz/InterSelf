"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { GoalRecord } from "@/types/productivity";

const GOAL_STORAGE_KEY = "interself-goals";


const DEFAULT_GOALS: GoalRecord[] = [
  {
    id: "weekly-impact",
    title: "Ship 3 high-impact tasks",
    timeframe: "WEEKLY",
    progress: 40,
    focusArea: "Execution",
    tasks: ["Plan deep work", "Launch outreach"],
  },
  {
    id: "monthly-learning",
    title: "Complete 2 certification modules",
    timeframe: "MONTHLY",
    progress: 25,
    focusArea: "Growth",
    tasks: ["Module 3 quiz", "Project practice"],
  },
];

export function GoalPlannerPanel() {
  const [goals, setGoals] = useState<GoalRecord[]>(DEFAULT_GOALS);
  const [newGoal, setNewGoal] = useState({ title: "", timeframe: "WEEKLY", focusArea: "Execution" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(GOAL_STORAGE_KEY);
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as GoalRecord[];
        setGoals(parsed);
      } catch {
        // ignore bad data
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const updateProgress = (goalId: string, value: number) => {
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, progress: value } : goal)));
  };

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    const entry: GoalRecord = {
      id: `${Date.now()}`,
      title: newGoal.title.trim(),
      timeframe: newGoal.timeframe as GoalRecord["timeframe"],
      focusArea: newGoal.focusArea,
      progress: 0,
      tasks: [],
    };
    setGoals((prev) => [entry, ...prev].slice(0, 6));
    setNewGoal({ title: "", timeframe: "WEEKLY", focusArea: "Execution" });
  };

  const overallProgress = useMemo(() => {
    if (!goals.length) return 0;
    return Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length);
  }, [goals]);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/80 via-[#14031c] to-[#08040f] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Goal Planner</p>
          <h3 className="text-2xl font-black">Quarterly Trajectory</h3>
          <p className="text-sm text-white/70">Link weekly and monthly quests to your bigger arc.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Overall momentum</p>
          <p className="text-3xl font-black text-cyan-300">{overallProgress}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{goal.title}</p>
                <p className="text-xs text-white/60">{goal.timeframe.toLowerCase()} · {goal.focusArea}</p>
              </div>
              <p className="text-lg font-black text-white">{goal.progress}%</p>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={goal.progress}
              onChange={(event) => updateProgress(goal.id, Number(event.target.value))}
              className="mt-3 w-full"
            />
            {goal.tasks.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-white/70">
                {goal.tasks.map((task, index) => (
                  <li key={`${goal.id}-${index}`} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-white/60" /> {task}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Add goal</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="Goal title"
            value={newGoal.title}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
            value={newGoal.timeframe}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, timeframe: event.target.value }))}
          >
            <option value="WEEKLY" className="text-black">
              Weekly
            </option>
            <option value="MONTHLY" className="text-black">
              Monthly
            </option>
          </select>
          <select
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
            value={newGoal.focusArea}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, focusArea: event.target.value }))}
          >
            <option value="Execution" className="text-black">
              Execution
            </option>
            <option value="Growth" className="text-black">
              Growth
            </option>
            <option value="Health" className="text-black">
              Health
            </option>
            <option value="Wealth" className="text-black">
              Wealth
            </option>
          </select>
          <Button onClick={addGoal}>Save goal</Button>
        </div>
      </div>
    </div>
  );
}
