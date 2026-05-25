"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { emitBossDamageEvent, emitTasksUpdatedEvent } from "@/lib/events";

type Task = { id: number; title: string; isSystem: boolean };
type Props = { tasks?: Task[]; completedTaskIds?: Set<number> };

const META: Array<{ match: string; icon: string; desc: string; bg: string }> = [
  { match: "meditate",   icon: "🧘", desc: "Calm your mind.",         bg: "rgba(34,211,238,0.12)"  },
  { match: "study",      icon: "📚", desc: "Level up your knowledge.", bg: "rgba(139,92,246,0.12)"  },
  { match: "workout",    icon: "💪", desc: "Train your body.",         bg: "rgba(239,68,68,0.12)"   },
  { match: "micro",      icon: "💪", desc: "Train your body.",         bg: "rgba(239,68,68,0.12)"   },
  { match: "read",       icon: "📖", desc: "Feed your mind.",          bg: "rgba(245,158,11,0.12)"  },
  { match: "neural",     icon: "📖", desc: "Feed your mind.",          bg: "rgba(245,158,11,0.12)"  },
  { match: "doomscroll", icon: "🚫", desc: "Protect your time.",       bg: "rgba(239,68,68,0.08)"   },
  { match: "solar",      icon: "☀️", desc: "Activate your morning.",   bg: "rgba(245,158,11,0.12)"  },
  { match: "wealth",     icon: "💰", desc: "Check your finances.",     bg: "rgba(245,158,11,0.12)"  },
  { match: "nightly",    icon: "🌙", desc: "Close out your day.",      bg: "rgba(99,102,241,0.12)"  },
  { match: "deep work",  icon: "💻", desc: "Focus sprint.",            bg: "rgba(99,102,241,0.12)"  },
  { match: "sesi",       icon: "📖", desc: "Feed your mind.",          bg: "rgba(245,158,11,0.12)"  },
];
const getMeta = (t: string) => META.find(m => t.toLowerCase().includes(m.match)) ?? { icon: "⭐", desc: "Complete this quest.", bg: "rgba(139,92,246,0.12)" };

const FALLBACK: Task[] = [
  { id: -1, title: "Meditate 10 minutes", isSystem: true },
  { id: -2, title: "Study 1 hour",        isSystem: true },
  { id: -3, title: "Workout",             isSystem: true },
  { id: -4, title: "Read 20 pages",       isSystem: true },
  { id: -5, title: "No Doomscrolling",    isSystem: true },
];
const FALLBACK_DONE = new Set([-1, -2, -3, -4]);
const STREAKS  = [7, 5, 3, 6, 2];
const REWARDS  = [{xp:20,c:10},{xp:40,c:20},{xp:40,c:20},{xp:20,c:10},{xp:30,c:15}];

export function DailyQuestsPanel({ tasks = [], completedTaskIds = new Set() }: Props) {
  const [done, setDone] = useState<Set<number>>(completedTaskIds);
  const [pending, start] = useTransition();
  const { push } = useToast();
  useEffect(() => { setDone(completedTaskIds); }, [completedTaskIds]);

  const complete = useCallback((id: number, isDone: boolean) => {
    if (isDone || id < 0) return;
    start(async () => {
      try {
        const res = await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
        if (!res.ok) throw new Error();
        setDone(p => new Set([...p, id]));
        emitTasksUpdatedEvent();
        emitBossDamageEvent({ damage: 500 });
        push({ title: "Quest complete! ✓", variant: "success" });
      } catch { push({ title: "Failed", variant: "error" }); }
    });
  }, [push]);

  const display = tasks.length > 0 ? tasks.slice(0, 5) : FALLBACK;
  const isFallback = tasks.length === 0;
  const completedSet = isFallback ? FALLBACK_DONE : done;
  const completedCount = isFallback ? 4 : done.size;
  const total = display.length;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "#0c1018" }}>

      {/* TODAY'S QUEST badge */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        background: "#fff", color: "#111", fontFamily: "monospace", fontSize: 9,
        fontWeight: 900, padding: "4px 14px", borderRadius: "0 0 10px 10px",
        letterSpacing: "0.1em", whiteSpace: "nowrap", zIndex: 10,
      }}>TODAY&apos;S QUEST</div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 16px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#fff" }}>
          <span>🚩</span><span>Daily Quests</span>
        </div>
      </div>

      {/* Bonus banner */}
      <div style={{ margin: "0 12px 10px", background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 8, padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#22d3ee" }}>Complete all for bonus!</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#22d3ee" }}>🎁 +150 XP &nbsp;🪙 +50 Coins</span>
      </div>

      {/* Quest list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "0 10px 10px" }}>
        {display.map((task, idx) => {
          const isDone = completedSet.has(task.id);
          const meta = getMeta(task.title);
          const streak = STREAKS[idx] ?? 1;
          const reward = REWARDS[idx] ?? {xp:20,c:10};
          return (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#111520", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "8px 10px",
              opacity: isDone ? 0.78 : 1,
            }}>
              {/* Icon */}
              <div style={{ width: 34, height: 34, flexShrink: 0, background: meta.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {meta.icon}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>{meta.desc}</div>
              </div>
              {/* Rewards */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: "#a78bfa" }}>+{reward.xp} XP</span>
                <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>🪙+{reward.c}</span>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "#f87171" }}>Streak {streak}🔥</span>
              </div>
              {/* Checkbox */}
              <button type="button" disabled={isDone || pending || task.id < 0}
                onClick={() => complete(task.id, isDone)}
                style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: 6,
                  border: isDone ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.12)",
                  background: isDone ? "rgba(139,92,246,0.35)" : "#161c2a",
                  color: "#c4b5fd", fontSize: 11, cursor: isDone ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {isDone && "✓"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div style={{ padding: "0 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
          <span>Daily Progress</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{completedCount} / {total} <span style={{ fontSize: 18 }}>🏆</span></span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${isFallback ? 80 : total > 0 ? Math.round((completedCount/total)*100) : 0}%`, background: "linear-gradient(90deg,#10b981,#3aaa7a)", borderRadius: 3, transition: "width 0.7s" }} />
        </div>
      </div>
    </div>
  );
}
