"use client";

import { useMemo, useState } from "react";

type Props = {
  completionsByDate?: Record<string, number>;
  bestStreak?: number;
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const BG = ["transparent","#16a34a60","#16a34a","#15803d","#14532d"];

export function HabitCalendarPanel({ completionsByDate = {}, bestStreak = 21 }: Props) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const y = view.getFullYear(), m = view.getMonth();

  const cells = useMemo(() => {
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    let dow = first.getDay() - 1; if (dow < 0) dow = 6;
    const out: Array<{ date: Date; day: number; outside: boolean; isToday: boolean }> = [];
    for (let i = 0; i < dow; i++) {
      const d = new Date(y, m, -dow + i + 1);
      out.push({ date: d, day: d.getDate(), outside: true, isToday: false });
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(y, m, d);
      out.push({ date, day: d, outside: false, isToday: date.toDateString() === today.toDateString() });
    }
    const rem = out.length % 7;
    if (rem) for (let d = 1; d <= 7 - rem; d++) {
      const date = new Date(y, m + 1, d);
      out.push({ date, day: d, outside: true, isToday: false });
    }
    return out;
  }, [y, m, today]);

  const getLevel = (date: Date, outside: boolean) => {
    if (outside || date > today) return 0;
    const key = date.toISOString().slice(0, 10);
    if (completionsByDate[key] !== undefined) {
      const c = completionsByDate[key]!;
      return c === 0 ? 0 : c <= 1 ? 1 : c <= 2 ? 2 : c <= 3 ? 3 : 4;
    }
    // Mock data: pattern matching mockup (Mon-Fri mostly filled, some weekend gaps)
    const d = date.getDate(), dow = date.getDay();
    if (d <= 0) return 0;
    // Specific gaps like mockup: 10,11,17,18 (sat/sun) empty
    if ((dow === 0 || dow === 6) && (d === 10 || d === 11 || d === 17 || d === 18 || d === 24 || d === 25)) return 0;
    if (d <= 4) return 2;
    if (d <= 9) return 4;
    if (d <= 16) return 3;
    if (d <= 23) return 4;
    return 4;
  };

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 16px 8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
            <span>🔥</span><span>Habit Calendar</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Your consistency heatmap</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" onClick={() => setView(new Date(y, m - 1, 1))}
            style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", width: 88, textAlign: "center" }}>{MONTHS[m]} {y}</span>
          <button type="button" onClick={() => setView(new Date(y, m + 1, 1))}
            style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          <button type="button"
            style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "3px 8px", fontSize: 9, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            This Month ▾
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 12px 4px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontFamily: "monospace", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {cells.map((c, i) => {
            const lv = getLevel(c.date, c.outside);
            const isFuture = !c.outside && c.date > today && !c.isToday;
            return (
              <div key={i} style={{
                aspectRatio: "1",
                borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 600,
                background: c.isToday ? "#161c2a" : BG[lv] ?? "transparent",
                color: c.isToday ? "#22d3ee" : c.outside ? "rgba(255,255,255,0.15)" : lv > 0 ? "#dcfce7" : "rgba(255,255,255,0.22)",
                opacity: c.outside ? 0.3 : isFuture ? 0.35 : 1,
                outline: c.isToday ? "1px solid #22d3ee" : undefined,
              }}>
                {c.day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px 4px" }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Less</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: BG[i] ?? "transparent", border: i === 0 ? "1px solid rgba(255,255,255,0.1)" : undefined }} />
          ))}
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>More</span>
      </div>

      {/* Best streak */}
      <div style={{ padding: "2px 14px 14px", fontSize: 10, fontWeight: 700, color: "#fff" }}>
        🔥 Best Streak: <span style={{ color: "#fb923c" }}>{bestStreak} days</span>
      </div>
    </div>
  );
}
