"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useProductivitySignals } from "@/hooks/use-productivity-signals";

export function AiCoachPanel() {
  const { taskSummary, focusTrend, habitScore } = useProductivitySignals();

  const insights = useMemo(() => {
    const tips: string[] = [];
    if (taskSummary.total > 0) {
      const rate = taskSummary.completed / taskSummary.total;
      if (rate < 0.5) {
        tips.push("Stack two easiest tasks at the start of your day to trigger a fast win combo.");
      } else {
        tips.push("Your completion rate is strong—try upgrading one task difficulty to boost EXP.");
      }
    }
    const avgFocus = focusTrend.length
      ? focusTrend.reduce((acc, point) => acc + point.minutes, 0) / focusTrend.length
      : 0;
    if (avgFocus < 25) {
      tips.push("Focus minutes are low. Deploy a 25-minute Pomodoro Battle before noon.");
    } else {
      tips.push("Momentum detected. Follow it with a 45-minute deep work sprint for bonus damage.");
    }
    if (habitScore.completion < 60) {
      tips.push("Habits need reinforcement. Anchor them to existing routines (e.g., journal right after coffee).");
    } else {
      tips.push("Habits look stable. Introduce one advanced ritual to keep the streak evolving.");
    }
    return tips.slice(0, 3);
  }, [focusTrend, habitScore, taskSummary]);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/75 via-[#0a131f] to-[#050409] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">AI Coach</p>
          <h3 className="text-2xl font-black">Productivity Oracle</h3>
        </div>
        <Button variant="ghost" size="sm" disabled>
          Auto
        </Button>
      </div>
      <p className="mt-2 text-sm text-white/70">Rule-based coach that adapts to your stats. No external API yet—just signal-driven guidance.</p>

      <div className="mt-5 space-y-3">
        {insights.map((tip, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
