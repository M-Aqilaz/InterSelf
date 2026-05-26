"use client";

import { useEffect, useState } from "react";

type Entry = {
  rank: number;
  username: string;
  title: string;
  level: number;
  exp: number;
  bestStreak?: number;
  isCurrentUser?: boolean;
};

export function LeaderboardPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const list = d.top ?? d.leaderboard ?? d.entries ?? (Array.isArray(d) ? d : []);
        setEntries(Array.isArray(list) ? list : []);
        setMyRank(d.userRank ?? d.myRank ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>Leaderboard</div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0 }}>Global Rankings</h3>
        </div>
        {myRank && (
          <div style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 10, padding: "6px 14px", fontSize: 11, fontWeight: 800, color: "#c4b5fd" }}>
            Your Rank #{myRank}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading rankings...</div>
      ) : !Array.isArray(entries) || entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No rankings yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {entries.slice(0, 10).map((e, idx) => {
            const isTop3 = (e.rank ?? idx + 1) <= 3;
            const isMe = e.isCurrentUser;
            const rank = e.rank ?? idx + 1;
            const streak = e.bestStreak ?? 0;
            return (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 20px",
                background: isMe ? "rgba(139,92,246,0.08)" : isTop3 ? "rgba(255,255,255,0.02)" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                borderLeft: isMe ? "3px solid rgba(139,92,246,0.5)" : "3px solid transparent",
              }}>
                <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                  {MEDALS[rank] ? (
                    <span style={{ fontSize: 20 }}>{MEDALS[rank]}</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>#{rank}</span>
                  )}
                </div>
                <div style={{
                  width: 38, height: 38, flexShrink: 0, borderRadius: 10,
                  background: isMe ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isMe ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 900, color: isMe ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                }}>
                  {e.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isMe ? "#c4b5fd" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.username}
                    </span>
                    {isMe && <span style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa", borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{e.title}</div>
                </div>
                <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Lvl {e.level}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{(e.exp ?? 0).toLocaleString()} EXP</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fb923c" }}>🔥 {streak}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Streak</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
