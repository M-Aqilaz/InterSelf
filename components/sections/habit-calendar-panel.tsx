"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type HabitCalendarPanelProps = {
  completionsByDate?: Record<string, number>;
  bestStreak?: number;
};

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function HabitCalendarPanel({
  completionsByDate = {},
  bestStreak = 21,
}: HabitCalendarPanelProps) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: Array<{
      date: Date;
      dayNum: number;
      isCurrent: boolean;
      isToday: boolean;
      isOutside: boolean;
    }> = [];

    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, -startDow + i + 1);
      cells.push({ date: d, dayNum: d.getDate(), isCurrent: false, isToday: false, isOutside: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
      cells.push({ date, dayNum: d, isCurrent: true, isToday, isOutside: false });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let d = 1; d <= 7 - remainder; d++) {
        const date = new Date(year, month + 1, d);
        cells.push({ date, dayNum: d, isCurrent: false, isToday: false, isOutside: true });
      }
    }
    return cells;
  }, [year, month, today]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getCount = (date: Date): number => {
    const key = date.toISOString().slice(0, 10);
    const real = completionsByDate[key];
    if (real !== undefined) return real;

    // Mock data: isi hari-hari di bulan ini yang sudah lewat (kecuali sabtu/minggu tertentu)
    if (date > today) return 0;
    const dow = date.getDay(); // 0=Sun, 6=Sat
    const d = date.getDate();
    // Gap di weekend tertentu sesuai mockup
    if (d === 10 || d === 11 || d === 17 || d === 18) return 0;
    return d <= 5 ? 2 : d <= 14 ? 4 : d <= 22 ? 3 : 4;
  };

  const getBg = (count: number, isOutside: boolean, isToday: boolean): string => {
    if (isToday) return "#161c2a";
    if (isOutside || count === 0) return "transparent";
    if (count === 1) return "#16a34a80";
    if (count === 2) return "#16a34a";
    if (count === 3) return "#15803d";
    return "#14532d";
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border"
      style={{ background: "#0c1018", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <span>🔥</span><span>Habit Calendar</span>
          </div>
          <div className="mt-[2px] text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            Your consistency heatmap
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sm hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}>‹</button>
          <span className="w-[90px] text-center text-[10px] font-bold text-white">
            {MONTHS[month]} {year}
          </span>
          <button type="button" onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sm hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}>›</button>
          <button type="button"
            className="rounded-md border px-2 py-[2px] text-[9px] font-semibold"
            style={{ background: "#111520", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
            This Month ▾
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-3 pb-1">
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center font-mono text-[9px] font-semibold"
              style={{ color: "rgba(255,255,255,0.3)" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const count = getCount(cell.date);
            const bg = getBg(count, cell.isOutside, cell.isToday);
            const isFuture = !cell.isOutside && cell.date > today && !cell.isToday;
            return (
              <div key={idx}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold",
                  cell.isOutside && "opacity-25",
                  isFuture && "opacity-40",
                )}
                style={{
                  background: bg,
                  color: cell.isToday ? "#22d3ee"
                    : cell.isOutside ? "rgba(255,255,255,0.2)"
                    : count > 0 ? "#dcfce7"
                    : "rgba(255,255,255,0.25)",
                  outline: cell.isToday ? "1px solid #22d3ee" : undefined,
                }}>
                {cell.dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 px-4 pb-1 pt-2">
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>Less</span>
        <div className="flex gap-1">
          {["#161c2a", "#16a34a80", "#16a34a", "#15803d", "#14532d"].map((bg, i) => (
            <div key={i} className="h-[10px] w-[10px] rounded-sm"
              style={{ background: bg, border: i === 0 ? "1px solid rgba(255,255,255,0.1)" : "none" }} />
          ))}
        </div>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>More</span>
      </div>

      {/* Best streak */}
      <div className="px-4 pb-4 pt-1 text-[10px] font-bold text-white">
        🔥 Best Streak: <span style={{ color: "#fb923c" }}>{bestStreak} days</span>
      </div>
    </div>
  );
}
