"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-[#0c0217] via-[#05010d] to-[#05001a] p-10 shadow-[0_20px_120px_rgba(32,4,63,0.8)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(118,92,255,0.45),_transparent_55%)]" />
      <div className="relative grid gap-12 lg:grid-cols-2">
        <FadeIn className="space-y-10">
          <Badge variant="neon" className="text-xs uppercase tracking-[0.4em]">
            Solo Leveling for your life
          </Badge>
          <div className="space-y-6">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Level Up Your Real Life with <span className="text-gradient">INTERSELF</span>
            </h1>
            <p className="text-lg text-white/70">
              Stack streaks, battle procrastination bosses, and evolve your avatar with every focused action. A cyberpunk RPG dashboard that turns discipline into a game.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button className="h-14 rounded-full text-base" asChild>
              <Link href="/register">Start Your Journey</Link>
            </Button>
            <Button variant="secondary" className="h-14 rounded-full text-base" asChild>
              <Link href="#systems">Explore Systems</Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Daily Players", value: "120K" },
              { label: "Tasks Dominated", value: "4.2M" },
              { label: "Bosses Slain", value: "96K" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 py-4 text-white/80"
              >
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.15} className="relative">
          <div className="relative h-full min-h-[420px]">
            <motion.div
              className="absolute inset-x-0 top-14 mx-auto h-80 w-full max-w-sm rounded-[32px] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 8 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-white/60">Current Level</p>
                  <p className="text-4xl font-black text-[#8a7bff]">27</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-white/60">Streak</p>
                  <p className="text-3xl font-black text-cyan-200">48</p>
                </div>
              </div>
              <div className="mt-10 space-y-4">
                {[
                  { label: "EXP", value: 72 },
                  { label: "Boss HP", value: 38 },
                  { label: "Challenge", value: 54 },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{bar.label}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8a7bff] to-cyan-400"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="absolute inset-x-6 bottom-6 rounded-[28px] border border-white/15 bg-gradient-to-r from-[rgba(138,123,255,0.2)] via-[#0bf] to-cyan-200/20 p-6 text-white"
              animate={{ y: [8, -8, 8] }}
              transition={{ repeat: Infinity, duration: 10, delay: 0.4 }}
            >
              <p className="text-sm uppercase text-white/60">Active Boss</p>
              <p className="text-2xl font-black">Doomscrolling Beast</p>
              <p className="text-sm text-white/70">Weakness: Focus Tasks</p>
            </motion.div>
            <Image
              src="/next.svg"
              alt="Dashboard placeholder"
              width={500}
              height={400}
              className="invisible"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
