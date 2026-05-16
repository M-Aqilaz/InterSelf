"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useProductivitySignals } from "@/hooks/use-productivity-signals";

export function ProductivityAnalyticsPanel() {
  const { taskSummary, focusTrend, habitScore } = useProductivitySignals();

  const completionRate = useMemo(() => {
    if (taskSummary.total === 0) return 0;
    return Math.round((taskSummary.completed / taskSummary.total) * 100);
  }, [taskSummary]);

  const strongestCategory = useMemo(() => {
    const entries = Object.entries(taskSummary.byCategory);
    if (!entries.length) return null;
    return entries
      .map(([key, value]) => ({ key, ratio: value.total ? value.completed / value.total : 0 }))
      .sort((a, b) => b.ratio - a.ratio)[0]?.key;
  }, [taskSummary]);

  const weakestCategory = useMemo(() => {
    const entries = Object.entries(taskSummary.byCategory);
    if (!entries.length) return null;
    return entries
      .map(([key, value]) => ({ key, ratio: value.total ? value.completed / value.total : 0 }))
      .sort((a, b) => a.ratio - b.ratio)[0]?.key;
  }, [taskSummary]);

  const trendMax = Math.max(60, ...focusTrend.map((point) => point.minutes));

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 via-[#0a101c] to-[#050309] p-6 text-white">
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">Productivity analytics</p>
      <h3 className="text-2xl font-black">Mission Control</h3>
      <p className="text-sm text-white/70">Track completed quests, focus momentum, and habit balance.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Task completion rate</p>
          <p className="text-4xl font-black text-cyan-300">{completionRate}%</p>
          <p className="text-xs text-white/60">{taskSummary.completed} / {taskSummary.total} tasks today</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Habit cadence</p>
          <p className="text-4xl font-black text-emerald-300">{habitScore.completion}%</p>
          <p className="text-xs text-white/60">Consistency over the last 7 days</p>
          <div className="mt-3 flex justify-between text-xs text-white/60">
            <span>Strongest: {habitScore.strongest ?? "—"}</span>
            <span>Weakest: {habitScore.weakest ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Focus trend</p>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {focusTrend.map((point) => (
            <div key={point.dayLabel} className="flex flex-col items-center gap-2 text-xs">
              <div className="h-24 w-6 rounded-full bg-white/10">
                <motion.div
                  className="w-full rounded-full bg-gradient-to-b from-cyan-400 to-transparent"
                  animate={{ height: `${(point.minutes / trendMax) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-white/60">{point.dayLabel}</span>
              <span className="text-white/80">{point.minutes}m</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Weekly summary</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
          <li>
            Strongest category: <span className="text-white">{strongestCategory ?? "Collecting data"}</span>
          </li>
          <li>
            Needs attention: <span className="text-white">{weakestCategory ?? "Collecting data"}</span>
          </li>
          <li>Average focus minutes: {Math.round(focusTrend.reduce((acc, point) => acc + point.minutes, 0) / (focusTrend.length || 1))}m</li>
        </ul>
      </div>
    </div>
  );
}
