import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const previews = [
  {
    title: "Command Deck",
    body: "Central HUD with EXP bar, dynamic streak heatmap, and holographic avatar.",
    pills: ["Level 19", "Streak 42", "+320 EXP"],
  },
  {
    title: "Squad Terminal",
    body: "Friends ranking, live activity pulses, and asynchronous co-op boosts.",
    pills: ["Bronze", "Online", "+Focus"],
  },
  {
    title: "Challenge Nexus",
    body: "Weekly Arcs with narrative voiceovers, reward wheels, and relic loot.",
    pills: ["Epic Loot", "XP Scroll", "New Quest"],
  },
];

export function LandingPreview() {
  return (
    <section className="space-y-12" id="systems">
      <Badge variant="cyber">Gameplay Loop</Badge>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeIn className="rounded-[36px] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-10 shadow-[0_40px_160px_rgba(38,13,76,0.6)]">
          <div className="max-w-xl space-y-6 text-white">
            <h2 className="text-4xl font-black">Master your rituals</h2>
            <p className="text-lg text-white/70">
              Craft quests, monitor stat deltas in real time, and trigger cinematic level-up sequences. INTERSELF syncs EXP, coins, and loot across devices instantly.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              {["Glass HUD", "Framer Motion", "NextAuth", "Prisma"].map((pill) => (
                <span key={pill} className="rounded-full border border-white/20 px-4 py-1">
                  {pill}
                </span>
              ))}
            </div>
            <Button className="mt-6 rounded-full">Preview Dashboard</Button>
          </div>
        </FadeIn>
        <div className="grid gap-6">
          {previews.map((preview, idx) => (
            <FadeIn key={preview.title} delay={idx * 0.05}>
              <Card className="border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">
                    {preview.title}
                  </h3>
                  <Badge variant="void">Alpha</Badge>
                </div>
                <p className="mt-4 text-sm text-white/70">{preview.body}</p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-white">
                  {preview.pills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
