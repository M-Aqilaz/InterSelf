"use client";

import { useMemo } from "react";
import { useProductivitySignals } from "@/hooks/use-productivity-signals";

export function ProductivityAnalyticsPanel() {
  const { taskSummary, focusTrend, habitScore: habitScoreRaw } = useProductivitySignals();
  const habitScore = typeof habitScoreRaw === "object" ? habitScoreRaw.completion : habitScoreRaw;

  const completionRate = useMemo(() => {
    if (taskSummary.total === 0) return 0;
    return Math.round((taskSummary.completed / taskSummary.total) * 100);
  }, [taskSummary]);

  const trendMax = Math.max(60, ...focusTrend.map(p => p.minutes));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>Productivity Analytics</div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0 }}>Mission Control</h3>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Task completion + Habit score side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Completion rate */}
          <div style={{ background: "#111520", borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Task Completion</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#22d3ee", lineHeight: 1 }}>{completionRate}%</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{taskSummary.completed} / {taskSummary.total} tasks today</div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${completionRate}%`, background: "linear-gradient(90deg, #22d3ee, #3aaa7a)", borderRadius: 3, transition: "width 0.5s" }} />
            </div>
          </div>

          {/* Habit score */}
          <div style={{ background: "#111520", borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Habit Score</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>{habitScore}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>/100</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Consistency this week</div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${habitScore}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 3 }} />
            </div>
          </div>
        </div>

        {/* Focus trend chart */}
        <div style={{ background: "#111520", borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Focus Trend (last 7 days)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {(focusTrend.length > 0 ? focusTrend : days.map((dayLabel) => ({ dayLabel, minutes: 0 }))).map((point, i) => {
              const pct = trendMax > 0 ? (point.minutes / trendMax) * 100 : 0;
              const hasData = point.minutes > 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: 64, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{
                      width: "70%", borderRadius: "4px 4px 0 0",
                      height: `${Math.max(pct, hasData ? 8 : 4)}%`,
                      minHeight: hasData ? 6 : 3,
                      background: hasData
                        ? `linear-gradient(180deg, #22d3ee, #0891b2)`
                        : "rgba(255,255,255,0.07)",
                      transition: "height 0.5s",
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                    {point.dayLabel?.slice(0, 3) ?? days[i]}
                  </div>
                  <div style={{ fontSize: 9, color: hasData ? "#22d3ee" : "rgba(255,255,255,0.2)" }}>
                    {point.minutes > 0 ? `${point.minutes}m` : "0m"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
}


