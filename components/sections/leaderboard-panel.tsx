"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  title: string;
  level: number;
  exp: number;
  bestStreak: number;
};

type LeaderboardData = {
  top: LeaderboardEntry[];
  userRank: number | null;
};

export function LeaderboardPanel() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load leaderboard");
      const json = (await res.json()) as LeaderboardData;
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadLeaderboard();
    })();
  }, [loadLeaderboard]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Leaderboard</p>
          <h3 className="text-2xl font-black text-white">Global Rankings</h3>
        </div>
        {data?.userRank && (
          <Badge variant="cyber">Your rank #{data.userRank}</Badge>
        )}
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading leaderboard...</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {data?.top.map((entry) => (
            <li key={entry.userId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-white/80">#{entry.rank}</span>
                <div>
                  <p className="font-semibold text-white">{entry.username}</p>
                  <p className="text-xs text-white/60">{entry.title}</p>
                </div>
              </div>
              <div className="text-right text-xs text-white/60">
                <p>Lvl {entry.level}</p>
                <p>{entry.exp} EXP · Streak {entry.bestStreak}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
