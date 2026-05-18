"use client";

import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flame, Target, Zap } from "lucide-react";
import { useCallback, type ReactNode } from "react";

export type TodayMissionHeroProps = {
  username: string;
  missionTitle: string;
  dailyCompletion: number;
  streak: number;
  level: number;
  expPercent: number;
  rank: string;
  energyPercent: number;
};

export function TodayMissionHero({
  username,
  missionTitle,
  dailyCompletion,
  streak,
  level,
  expPercent,
  rank,
  energyPercent,
}: TodayMissionHeroProps) {
  const prefersReduced = useReducedMotion();
  const scrollTo = useCallback((selector: string) => {
    if (typeof window === "undefined") return;
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const displayName = username || "Hunter";
  const expValue = Math.max(0, Math.min(100, expPercent));
  const completionValue = Math.max(0, Math.min(100, dailyCompletion));
  const energyValue = Math.max(0, Math.min(100, energyPercent));

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0c1224] via-[#0a1d2e] to-[#07121f] p-6 text-white shadow-xl md:p-8"
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-white/70">Welcome back, {displayName}</p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-white md:text-4xl">Today&rsquo;s mission</h1>
            <p className="mt-2 text-base text-white/80">{missionTitle}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-cyan-400 px-6 py-2 text-base font-semibold text-slate-950 hover:bg-cyan-300"
              onClick={() => scrollTo("#focus")}
            >
              Start Focus Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="border border-white/20 px-6 py-2 text-base text-white hover:bg-white/10"
              onClick={() => scrollTo("#progress")}
            >
              View Tasks
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroMetric
              label="Completion"
              value={`${completionValue}%`}
              description="Daily momentum"
              icon={<Target className="h-4 w-4 text-cyan-300" />}
            />
            <HeroMetric
              label="Streak"
              value={`${streak} days`}
              description="Consistency"
              icon={<Flame className="h-4 w-4 text-amber-300" />}
            />
          </div>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Level {level}</p>
              <p className="text-2xl font-bold text-white">Rank {rank}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-lg font-black text-white">
              {level}
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <ProgressMeter label="EXP" value={expValue} accent="bg-violet-400" />
            <ProgressMeter label="Energy" value={energyValue} accent="bg-emerald-400" icon={<Zap className="h-3 w-3" />} />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <p className="font-semibold text-white">Daily Completion</p>
            <p className="text-4xl font-black text-white">{completionValue}%</p>
            <p className="mt-1 text-xs text-white/60">Keep pushing to complete today&rsquo;s quest.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroMetric({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-white/70">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  );
}

function ProgressMeter({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-white/60">
        <span className="flex items-center gap-1 text-white/70">
          {icon}
          {label}
        </span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${accent}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
