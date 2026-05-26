"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type HabitCalendarPanelProps = {
  completionsByDate?: Record<string, number>; // date string -> count completed
  bestStreak?: number;
};

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDayIntensity(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 3) return 3;
  return 4;
}

const INTENSITY_STYLES: Record<number, { bg: string; color: string }> = {
  0: { bg: "transparent", color: "rgba(255,255,255,0.2)" },
  1: { bg: "#16a34a80", color: "#dcfce7" },
  2: { bg: "#16a34aaa", color: "#dcfce7" },
  3: { bg: "#15803d", color: "#dcfce7" },
  4: { bg: "#14532d", color: "#bbf7d0" },
};

export function HabitCalendarPanel({
  completionsByDate = {},
  bestStreak = 21,
}: HabitCalendarPanelProps) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTHS[month];

  // Build calendar days
  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Monday=0, Sunday=6 mapping
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6; // Sunday → index 6

    const cells: Array<{ date: Date | null; dayNum: number | null; isCurrent: boolean; isToday: boolean; isOutside: boolean }> = [];

    // Pad before
    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, -startDow + i + 1);
      cells.push({ date: d, dayNum: d.getDate(), isCurrent: false, isToday: false, isOutside: true });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
      cells.push({ date, dayNum: d, isCurrent: true, isToday, isOutside: false });
    }

    // Pad after (to complete 6 rows = 42 cells)
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let d = 1; d <= needed; d++) {
        const date = new Date(year, month + 1, d);
        cells.push({ date, dayNum: d, isCurrent: false, isToday: false, isOutside: true });
      }
    }

    return cells;
  }, [year, month, today]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border"
      style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <span>🔥</span>
            <span>Habit Calendar</span>
          </div>
          <div className="mt-[2px] text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            Your consistency heatmap
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-sm transition hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            ‹
          </button>
          <span className="w-20 text-center text-[11px] font-bold text-white">
            {monthName} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-sm transition hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            ›
          </button>
          <button
            type="button"
            className="rounded-lg border px-2 py-[2px] text-[9px] font-semibold"
            style={{
              background: "#111520",
              borderColor: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            This Month ▾
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-3 pb-2">
        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="text-center font-mono text-[9px] font-semibold"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            if (!cell.date || !cell.dayNum) return <div key={idx} />;

            const key = getDateKey(cell.date);
            const count = completionsByDate[key] ?? 0;

            // Use mock data matching the mockup for current month display
            let displayCount = count;
            if (Object.keys(completionsByDate).length === 0 && cell.isCurrent && !cell.isOutside) {
              const d = cell.dayNum;
              // Replicate mockup pattern: most days filled, few gaps on specific weekends
              if (d <= 22 && d !== 10 && d !== 11 && d !== 17 && d !== 18) {
                displayCount = d <= 5 ? 2 : d <= 14 ? 4 : d <= 22 ? 3 : 0;
              }
            }

            const intensity = cell.isOutside ? 0 : getDayIntensity(displayCount);
            const style = INTENSITY_STYLES[intensity];
            const isFuture = cell.isCurrent && cell.date > today && !cell.isToday;

            return (
              <div
                key={idx}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold transition",
                  cell.isOutside && "opacity-20",
                  isFuture && "opacity-40",
                  cell.isToday && "ring-1"
                )}
                style={{
                  background: cell.isToday
                    ? "#161c2a"
                    : intensity > 0
                    ? style.bg
                    : "transparent",
                  color: cell.isToday ? "#22d3ee" : cell.isOutside ? "rgba(255,255,255,0.2)" : style.color || "rgba(255,255,255,0.25)",
                  ringColor: cell.isToday ? "#22d3ee" : undefined,
                  ...(cell.isToday ? { outline: "1px solid #22d3ee" } : {}),
                }}
              >
                {cell.dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[10px] w-[10px] rounded-sm"
              style={{
                background: i === 0 ? "#161c2a" : INTENSITY_STYLES[i].bg,
                border: i === 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
              }}
            />
          ))}
        </div>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>More</span>
      </div>

      {/* Best streak */}
      <div className="px-4 pb-4 text-[10px] font-bold text-white">
        🔥 Best Streak:{" "}
        <span style={{ color: "#fb923c" }}>{bestStreak} days</span>
      </div>
    </div>
  );
}
