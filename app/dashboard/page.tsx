import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BossBattlePanel } from "@/components/sections/boss-battle";
import { AchievementsPanel } from "@/components/sections/achievements-panel";
import { InventoryPanel } from "@/components/sections/inventory-panel";
import { LeaderboardPanel } from "@/components/sections/leaderboard-panel";
import { FriendsPanel } from "@/components/sections/friends-panel";
import { WeeklyChallengesPanel } from "@/components/sections/weekly-challenges-panel";
import { DailyTasksPanel } from "@/components/sections/daily-tasks-panel";
import { CharacterProfilePanel } from "@/components/sections/character-profile-panel";
import { PvpPreviewPanel } from "@/components/sections/pvp-preview-panel";
import { DungeonNavigationPanel } from "@/components/sections/dungeon-navigation-panel";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromTotalExp } from "@/lib/level";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRecord, equippedRelics] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.userInventory.findMany({
      where: { userId: user.id, equipped: true },
      include: { item: true },
      orderBy: { acquiredAt: "desc" },
      take: 3,
    }),
  ]);

  const stats = user.stats ?? [];
  const profileExp = profileRecord?.exp ?? 0;
  const levelProgress = calculateLevelFromTotalExp(profileExp);
  const powerScore = Math.round((profileRecord?.level ?? levelProgress.level) * 120 + (profileRecord?.coins ?? 0) / 150 + stats.reduce((acc, stat) => acc + stat.value, 0));
  const equippedSlots = equippedRelics.map((entry, index) => ({
    slot: ["Core Relic", "Augment", "Support"][index] ?? `Slot ${index + 1}`,
    item: entry.item
      ? {
          id: entry.item.id,
          name: entry.item.name,
          rarity: entry.item.rarity,
          description: entry.item.description,
        }
      : null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section id="character" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CharacterProfilePanel
          username={user.profile?.username ?? user.name ?? "Hunter"}
          title={user.profile?.title ?? "Awakened"}
          rank={user.profile?.rank ?? "BRONZE"}
          level={profileRecord?.level ?? levelProgress.level}
          expIntoLevel={levelProgress.expIntoLevel}
          expForNextLevel={levelProgress.expForNextLevel}
          coins={profileRecord?.coins ?? 0}
          streak={profileRecord?.streak ?? 0}
          bestStreak={profileRecord?.bestStreak ?? 0}
          powerScore={powerScore}
          equippedSlots={equippedSlots}
          stats={stats.map((stat) => ({ type: stat.type, value: stat.value }))}
        />
        <DailyTasksPanel />
      </section>

      <section id="arena" className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <BossBattlePanel />
        <WeeklyChallengesPanel />
      </section>

      <section id="systems" className="grid gap-6 xl:grid-cols-3">
        <InventoryPanel />
        <AchievementsPanel />
        <PvpPreviewPanel />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LeaderboardPanel />
        <FriendsPanel />
      </section>

      <section className="grid gap-6 xl:grid-cols-2" id="exploration">
        <DungeonNavigationPanel />
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-white/70">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Audio & Feedback</p>
          <p className="text-sm">All major interactions now emit subtle synth cues via the useGameAudio hook. Players can mute via browser controls.</p>
        </div>
      </section>
    </div>
  );
}
