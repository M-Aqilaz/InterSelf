"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import type { DungeonZone } from "@/app/api/dungeon/route";

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  F: { color: "var(--t2)",         bg: "rgba(255,255,255,0.05)", border: "var(--border)",              label: "Tier F" },
  E: { color: "var(--jade-light)", bg: "rgba(58,170,122,0.08)",  border: "rgba(58,170,122,0.25)",      label: "Tier E" },
  D: { color: "#67e8f9",           bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)",       label: "Tier D" },
  C: { color: "#93c5fd",           bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",       label: "Tier C" },
  B: { color: "#a78bfa",           bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.25)",      label: "Tier B" },
  A: { color: "var(--gold)",       bg: "rgba(212,168,67,0.08)",  border: "rgba(212,168,67,0.3)",       label: "Tier A" },
  S: { color: "var(--rose-light)", bg: "rgba(224,90,106,0.08)",  border: "rgba(224,90,106,0.3)",       label: "Tier S" },
};

const WEAKNESS_LABEL: Record<string, string> = {
  FOCUS: "⚡ Focus",
  WORKOUT: "💪 Workout",
  STUDY: "📚 Study",
  SAVE_MONEY: "💰 Finance",
  WAKE_UP: "🌅 Wake Up",
  CONSISTENCY: "🔥 Consistency",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function HpBar({ pct }: { pct: number }) {
  const color =
    pct > 60 ? "bg-emerald-500" :
    pct > 30 ? "bg-amber-500" :
    "bg-rose-500";

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-white/40 mb-1">
        <span>Boss HP</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function DungeonCard({
  dungeon,
  onEnter,
  entering,
}: {
  dungeon: DungeonZone;
  onEnter: (bossId: number) => void;
  entering: number | null;
}) {
  const tier = TIER_STYLES[dungeon.dungeonTier] ?? TIER_STYLES.F;
  const isEntering = entering === dungeon.bossId;
  const [showLore, setShowLore] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "relative overflow-hidden rounded-2xl border transition-all duration-200",
        dungeon.isConquered
          ? "border-white/10 bg-white/3 opacity-60"
        : dungeon.isCurrentBoss
          ? "bg-white/6 shadow-lg"
          : dungeon.isUnlocked
          ? "bg-white/4 hover:bg-white/6 hover:shadow-md"
          : "border-white/5 bg-white/2",
      ].join(" ")}
      style={{
        borderColor: dungeon.isConquered ? undefined : dungeon.isUnlocked ? tier.border : undefined,
      }}
    >
      {/* Active indicator pulse */}
      {dungeon.isCurrentBoss && (
        <motion.div
          className={`absolute top-3 right-3 w-2 h-2 rounded-full ${tier.color.replace("text-", "bg-")}`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Tier badge */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border" style={{ background: tier.bg, color: tier.color, borderColor: tier.border }}>
            {dungeon.dungeonTier}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-bold ${dungeon.isUnlocked ? "text-white" : "text-white/30"}`}>
                {dungeon.dungeonName}
              </p>
              {dungeon.isCurrentBoss && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border" style={{ background: tier.bg, color: tier.color, borderColor: tier.border }}>
                  AKTIF
                </span>
              )}
              {dungeon.isConquered && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ✓ CONQUERED
                </span>
              )}
            </div>
            <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${dungeon.isUnlocked ? "text-white/40" : "text-white/20"}`}>
              {dungeon.dungeonBiome}
            </p>
          </div>

          {/* Lock indicator */}
          {!dungeon.isUnlocked && (
            <div className="flex-shrink-0 text-right">
              <p className="text-lg">🔒</p>
              <p className="text-[10px] text-white/30 mt-0.5">Lv.{dungeon.minLevel}</p>
            </div>
          )}
        </div>

        {/* Boss info */}
        <div className={`text-xs mb-3 ${dungeon.isUnlocked ? "text-white/60" : "text-white/25"}`}>
          <span className="font-semibold">{dungeon.bossName}</span>
          {dungeon.weakness && (
              <span className="ml-2 text-[10px]" style={{ color: tier.color }}>
                · Lemah vs {WEAKNESS_LABEL[dungeon.weakness] ?? dungeon.weakness}
              </span>
          )}
        </div>

        {/* HP bar untuk yang sudah dimulai */}
        {dungeon.isUnlocked && !dungeon.isConquered && dungeon.percentageRemaining !== null && (
          <HpBar pct={dungeon.percentageRemaining} />
        )}

        {/* Rewards */}
        {dungeon.isUnlocked && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] bg-[rgba(58,170,122,0.1)] text-[var(--jade-light)] px-2 py-0.5 rounded-md font-semibold">
              +{dungeon.rewardExp} EXP
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
              +{dungeon.rewardCoins} coins
            </span>
            {dungeon.rewardItemName && (
              <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                🎁 {dungeon.rewardItemName}
              </span>
            )}
            {dungeon.loreText && (
              <button
                onClick={() => setShowLore((v) => !v)}
                className="ml-auto text-[10px] text-white/30 hover:text-white/50"
              >
                {showLore ? "tutup lore" : "lihat lore"}
              </button>
            )}
          </div>
        )}

        {/* Lore text */}
        <AnimatePresence>
          {showLore && dungeon.loreText && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-[11px] text-white/40 italic border-l-2 border-white/10 pl-2 overflow-hidden"
            >
&ldquo;{dungeon.loreText}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>

        {/* Enter / locked button */}
        <div className="mt-3">
          {dungeon.isConquered ? (
            <div className="w-full rounded-xl py-2 text-center text-xs text-emerald-400/60 bg-emerald-500/5 border border-emerald-500/10">
              ✓ Dungeon Takluk
            </div>
          ) : dungeon.isCurrentBoss ? (
            <div className="w-full rounded-xl py-2 text-center text-xs font-bold border" style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}>
              ⚔️ Sedang Berlangsung — selesaikan task untuk menyerang
            </div>
          ) : dungeon.isUnlocked ? (
            <button
              onClick={() => onEnter(dungeon.bossId)}
              disabled={isEntering}
              className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${isEntering ? "bg-white/5 text-white/30 cursor-wait" : "hover:opacity-80 active:scale-[0.99]"}`}
              style={
                isEntering
                  ? undefined
                  : {
                      background: "var(--gold)",
                      border: "none",
                      color: "var(--bg-base)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                    }
              }
            >
              {isEntering ? "Memasuki dungeon..." : `Masuk ${dungeon.dungeonName} →`}
            </button>
          ) : (
            <div className="w-full rounded-xl py-2 text-center text-xs text-white/20 bg-white/3 border border-white/5">
              🔒 Butuh Level {dungeon.minLevel}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function DungeonNavigationPanel() {
  const { push } = useToast();
  const [dungeons, setDungeons] = useState<DungeonZone[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const loadDungeons = useCallback(async () => {
    try {
      const res = await fetch("/api/dungeon", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDungeons(data.dungeons ?? []);
        setUserLevel(data.userLevel ?? 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await loadDungeons();
    };
    void load();
    return () => { mounted = false; };
  }, [loadDungeons]);

  const handleEnter = useCallback(async (bossId: number) => {
    if (entering !== null) return;
    setEntering(bossId);

    const res = await fetch("/api/dungeon/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bossId }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const dungeon = dungeons.find((d) => d.bossId === bossId);
      push({ title: `Memasuki ${dungeon?.dungeonName ?? "dungeon"}!`, variant: "success" });
      void loadDungeons();
    } else {
      push({ title: data.error ?? "Gagal masuk dungeon", variant: "error" });
    }

    setEntering(null);
  }, [entering, dungeons, loadDungeons, push]);

  const nextUnlock = dungeons.find((d) => !d.isUnlocked);
  const conqueredCount = dungeons.filter((d) => d.isConquered).length;

  const filtered = dungeons.filter((d) => {
    if (filter === "unlocked") return d.isUnlocked;
    if (filter === "locked") return !d.isUnlocked;
    return true;
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#04060f] via-[#06021a] to-[#130823] p-6 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1000&q=40')", backgroundSize: "cover" }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Eksplorasi</p>
            <h3 className="text-2xl font-black">Dungeon Atlas</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Level {userLevel} · {conqueredCount}/{dungeons.length} dungeon ditaklukkan
            </p>
          </div>

          {/* Next unlock info */}
          {nextUnlock && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
              <p className="text-[9px] text-white/40 uppercase tracking-wider">Berikutnya terbuka</p>
              <p className="text-xs font-bold text-white">{nextUnlock.dungeonName}</p>
              <p className="text-[10px] text-white/40">Level {nextUnlock.minLevel} (+{nextUnlock.minLevel - userLevel} lagi)</p>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-5">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {f === "all" ? "Semua" : f === "unlocked" ? "Terbuka" : "Terkunci"}
            </button>
          ))}
        </div>

        {/* Progress bar keseluruhan */}
        <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
            <span>Progress Atlas</span>
            <span>{conqueredCount} / {dungeons.length} dungeon</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)]"
              animate={{ width: dungeons.length > 0 ? `${(conqueredCount / dungeons.length) * 100}%` : "0%" }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Dungeon list */}
        {loading ? (
          <div className="py-10 text-center text-white/30 text-sm">Memuat dungeon atlas...</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {filtered.map((dungeon) => (
                <DungeonCard
                  key={dungeon.bossId}
                  dungeon={dungeon}
                  onEnter={handleEnter}
                  entering={entering}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
