import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { BossBattlePanel } from "@/components/sections/boss-battle";
import { AchievementsPanel } from "@/components/sections/achievements-panel";
import { InventoryPanel } from "@/components/sections/inventory-panel";
import { LeaderboardPanel } from "@/components/sections/leaderboard-panel";
import { FriendsPanel } from "@/components/sections/friends-panel";
import { WeeklyChallengesPanel } from "@/components/sections/weekly-challenges-panel";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const stats = user.stats ?? [];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8">
      <Card className="border-white/10 bg-white/5">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">Current Rank</p>
          <h1 className="text-3xl font-black text-white">{user.profile?.title ?? "Awakened"}</h1>
          <p className="text-white/70">Welcome back, {user.profile?.username ?? user.name ?? "Hunter"}.</p>
        </div>
      </Card>
      <Card className="border-white/10 bg-white/5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.length === 0 ? (
            <p className="text-sm text-white/60 sm:col-span-2 lg:col-span-4">
              Stats will appear once you start completing tasks.
            </p>
          ) : (
            stats.map((stat: { type: string; value: number }) => (
              <div
                key={stat.type}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{stat.type}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))
          )}
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <BossBattlePanel />
        <WeeklyChallengesPanel />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <AchievementsPanel />
        <InventoryPanel />
        <LeaderboardPanel />
      </div>
      <FriendsPanel />
    </div>
  );
}
