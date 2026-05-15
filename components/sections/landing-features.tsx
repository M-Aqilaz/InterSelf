import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Brain, Flame, Swords, Shield, Users, Zap } from "lucide-react";

const features: { icon: LucideIcon; title: string; body: string; tag: string }[] = [
  {
    icon: Brain,
    title: "Adaptive Stat Engine",
    body: "Every completed quest rewires your avatar's attributes across Discipline, Focus, and Intelligence.",
    tag: "Stats",
  },
  {
    icon: Swords,
    title: "Boss Raids",
    body: "Battle Procrastination Monsters and Doomscrolling Beasts with streak multipliers and team boosts.",
    tag: "Battle",
  },
  {
    icon: Flame,
    title: "Weekly Arcs",
    body: "Narrative-driven challenges like Focus Week or Workout Arc with cosmetic drops and relic items.",
    tag: "Challenges",
  },
  {
    icon: Shield,
    title: "Achievement Codex",
    body: "Unlock cinematic badges such as Boss Slayer, Grind King, and Streak Hunter.",
    tag: "Legacy",
  },
  {
    icon: Zap,
    title: "Real-Time HUD",
    body: "Glassmorphism dashboards, level-up cinematics, and EXP popovers for every completed ritual.",
    tag: "HUD",
  },
  {
    icon: Users,
    title: "Squad Synergy",
    body: "Friends list, stat comparison cards, and asynchronous co-op quests with loot sharing.",
    tag: "Social",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="space-y-12">
      <FadeIn className="flex flex-col gap-4 text-center">
        <Badge variant="void" className="mx-auto w-fit">
          Systems Online
        </Badge>
        <h2 className="text-4xl font-black text-white">RPG-grade mechanics</h2>
        <p className="text-lg text-white/70">
          Every productivity ritual feeds into stats, loot tables, and cinematic boss encounters.
        </p>
      </FadeIn>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <FadeIn key={feature.title} delay={index * 0.05}>
            <Card className="flex h-full flex-col gap-6 border-white/5 bg-white/5">
              <div className="flex items-center justify-between">
                <feature.icon className="h-10 w-10 text-[#8a7bff]" />
                <Badge variant="cyber">{feature.tag}</Badge>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-white/70">{feature.body}</p>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
