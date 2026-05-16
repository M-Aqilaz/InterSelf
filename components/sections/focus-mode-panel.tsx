"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGameAudio } from "@/hooks/use-game-audio";
import type { FocusSession } from "@/types/productivity";

const HISTORY_KEY = "interself-focus-history";

const readHistory = () => {
  if (typeof window === "undefined") return [] as FocusSession[];
  const stored = window.localStorage.getItem(HISTORY_KEY);
  if (!stored) return [] as FocusSession[];
  try {
    return JSON.parse(stored) as FocusSession[];
  } catch {
    return [] as FocusSession[];
  }
};

const SESSION_PRESETS = [
  { id: "classic", label: "25 min", minutes: 25, description: "Pomodoro sprint" },
  { id: "power", label: "45 min", minutes: 45, description: "Deep work" },
  { id: "endurance", label: "60 min", minutes: 60, description: "Long form" },
];

const SESSION_THEMES = [
  { id: "Deep Work", color: "from-cyan-500/20 to-emerald-500/10" },
  { id: "Admin Sweep", color: "from-amber-500/20 to-rose-500/10" },
  { id: "Learning Arc", color: "from-indigo-500/20 to-fuchsia-500/10" },
];

const SECOND = 1000;

const FLOAT_TONES = {
  damage: "text-rose-300",
  crit: "text-amber-200",
  energy: "text-emerald-300",
  exp: "text-cyan-300",
  coins: "text-amber-300",
  system: "text-white/80",
} as const;

type FloatingText = {
  id: string;
  label: string;
  tone: keyof typeof FLOAT_TONES;
  offset: number;
};

type BossStrikeResult = {
  damage?: number;
  exp?: number;
  coins?: number;
};

export function FocusModePanel() {
  const [history, setHistory] = useState<FocusSession[]>(() => readHistory());
  const [minutes, setMinutes] = useState(25);
  const [theme, setTheme] = useState(SESSION_THEMES[0].id);
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [floating, setFloating] = useState<FloatingText[]>([]);
  const [remainingMs, setRemainingMs] = useState(minutes * 60 * SECOND);
  const [customMinutes, setCustomMinutes] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { play } = useGameAudio();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event("interself-focus-sync"));
  }, [history]);

  const remainingDisplay = useMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / SECOND));
    const mins = Math.floor(totalSeconds / 60);
    const secs = `${totalSeconds % 60}`.padStart(2, "0");
    return `${mins}:${secs}`;
  }, [remainingMs]);

  const todaysMinutes = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return history
      .filter((session) => session.completedAt.slice(0, 10) === todayKey)
      .reduce((acc, session) => acc + session.duration, 0);
  }, [history]);

  const streakCount = useMemo(() => {
    let streak = 0;
    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      const hasSession = history.some((session) => session.completedAt.slice(0, 10) === key);
      if (hasSession) streak += 1;
      else break;
    }
    return streak;
  }, [history]);

  const sessionProgress = useMemo(() => {
    return Math.min(100, Math.round(((minutes * 60 * SECOND - remainingMs) / (minutes * 60 * SECOND)) * 100));
  }, [minutes, remainingMs]);

  const pushFloating = useCallback((label: string, tone: FloatingText["tone"]) => {
    const entry: FloatingText = {
      id: `${label}-${Date.now()}`,
      label,
      tone,
      offset: 20 + Math.random() * 60,
    };
    setFloating((prev) => [...prev, entry]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((item) => item.id !== entry.id));
    }, 2200);
  }, []);

  const handleStart = () => {
    if (status === "running") return;
    setStatus("running");
    play("nav", 120);
  };

  const handlePause = () => {
    if (status !== "running") return;
    setStatus("paused");
    play("nav", 80);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStatus("idle");
    setRemainingMs(minutes * 60 * SECOND);
  };

  const strikeBoss = useCallback(async (): Promise<BossStrikeResult | undefined> => {
    try {
      const res = await fetch("/api/boss/attack", { method: "POST" });
      if (!res.ok) return undefined;
      const data = (await res.json()) as {
        damageApplied: number;
        rewards?: { exp: number; coins: number } | null;
      };
      return {
        damage: data.damageApplied,
        exp: data.rewards?.exp ?? 0,
        coins: data.rewards?.coins ?? 0,
      };
    } catch {
      return undefined;
    }
  }, []);

  const completeSession = useCallback(async () => {
    play("attack", 200);
    const reward = await strikeBoss();
    const entry: FocusSession = {
      id: `${Date.now()}`,
      duration: minutes,
      label: theme,
      completedAt: new Date().toISOString(),
      reward,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 24));
    if (reward?.damage) {
      pushFloating(`-${reward.damage} boss HP`, "damage");
    }
    if (reward?.exp) {
      pushFloating(`+${reward.exp} EXP`, "exp");
    }
    if (reward?.coins) {
      pushFloating(`+${reward.coins} Coins`, "coins");
    }
    pushFloating(`Focus +${minutes}m`, "energy");
    setStatus("idle");
    setRemainingMs(minutes * 60 * SECOND);
  }, [minutes, pushFloating, play, strikeBoss, theme]);

  useEffect(() => {
    if (status !== "running") return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= SECOND) {
          clearInterval(intervalRef.current!);
          completeSession();
          return 0;
        }
        return prev - SECOND;
      });
    }, SECOND);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, completeSession]);

  useEffect(() => {
    if (status === "running") return;
    const id = requestAnimationFrame(() => {
      setRemainingMs(minutes * 60 * SECOND);
    });
    return () => cancelAnimationFrame(id);
  }, [minutes, status]);

  const currentTheme = SESSION_THEMES.find((entry) => entry.id === theme) ?? SESSION_THEMES[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/80 via-[#0c0a1a] to-[#120226] p-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br opacity-30" style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.15), rgba(236,72,153,0.08))` }} />
      </div>
      <div className="relative">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Focus Mode</p>
          <h3 className="text-2xl font-black">Pomodoro Battle</h3>
          <p className="text-sm text-white/70">Complete a focus session to strike the distraction boss and log deep work minutes.</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,0.9fr]">
          <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${currentTheme.color} p-5 shadow-[0_0_40px_rgba(46,16,101,0.4)]`}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">Session</p>
                  <p className="text-lg font-semibold">{theme}</p>
                </div>
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/80"
                >
                  {SESSION_THEMES.map((entry) => (
                    <option key={entry.id} value={entry.id} className="text-black">
                      {entry.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Timer</p>
                <p className="text-5xl font-black tracking-wider">{remainingDisplay}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                    animate={{ width: `${status === "idle" ? 0 : sessionProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {SESSION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => status === "running" ? null : setMinutes(preset.minutes)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      minutes === preset.minutes ? "border-cyan-300 bg-cyan-500/20" : "border-white/15 text-white/70"
                    } ${status === "running" ? "opacity-50" : ""}`}
                    disabled={status === "running"}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.35em] text-white/50">Custom length</label>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={customMinutes}
                  onChange={(event) => setCustomMinutes(Number(event.target.value))}
                  disabled={status === "running"}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={status === "running"}
                  onClick={() => setMinutes(customMinutes)}
                >
                  Use {customMinutes} min
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {status !== "running" && (
                  <Button className="flex-1" onClick={handleStart}>
                    {status === "paused" ? "Resume" : "Start Focus"}
                  </Button>
                )}
                {status === "running" && (
                  <Button variant="secondary" className="flex-1" onClick={handlePause}>
                    Pause
                  </Button>
                )}
                <Button variant="ghost" className="flex-1" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {floating.map((entry) => (
                <motion.span
                  key={entry.id}
                  className={`pointer-events-none absolute text-sm font-semibold ${FLOAT_TONES[entry.tone]}`}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -60 }}
                  exit={{ opacity: 0, y: -80 }}
                  style={{ left: `${entry.offset}%`, top: "35%" }}
                >
                  {entry.label}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Focus stats</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatCard label="Minutes today" value={`${todaysMinutes}m`} detail="Logged focus energy" />
              <StatCard label="Session streak" value={`${streakCount}d`} detail="Consecutive days" />
              <StatCard label="Total sessions" value={history.length.toString()} detail="Last 24 saved" />
              <StatCard label="Progress" value={`${sessionProgress}%`} detail="Current sprint" />
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Recent sessions</p>
              <div className="mt-3 space-y-3 max-h-56 overflow-y-auto pr-1">
                {history.length === 0 && <p className="text-sm text-white/60">Complete a session to log your focus streak.</p>}
                {history.slice(0, 6).map((session) => (
                  <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold">{session.label}</p>
                        <p className="text-xs text-white/60">{new Date(session.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="text-right text-xs text-white/70">
                        <p>{session.duration} min</p>
                        {session.reward?.damage ? <p className="text-rose-200">-{session.reward.damage} boss HP</p> : null}
                      </div>
                    </div>
                    {(session.reward?.exp ?? 0) > 0 || (session.reward?.coins ?? 0) > 0 ? (
                      <p className="mt-1 text-[11px] text-white/60">
                        {session.reward?.exp ? `+${session.reward.exp} EXP` : ""}
                        {session.reward?.coins ? ` · +${session.reward.coins} coins` : ""}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/60">{detail}</p>
    </div>
  );
}
