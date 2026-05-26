"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { subscribeToTasksUpdate } from "@/lib/events";

// API returns: { boss: { name, level, maxHp, rewardExp, rewardCoins, weakness? }, progress: { currentHp, id }, cooldownRemainingMs, percentageRemaining }
type ApiResponse = {
  boss: { id: number; name: string; level?: number; maxHp: number; rewardExp: number; rewardCoins: number; weakness?: string; flavorText?: string } | null;
  progress: { id: number; currentHp: number; status?: string } | null;
  cooldownRemainingMs: number;
  percentageRemaining: number | null;
};

type LogEntry = { msg: string; type: "damage" | "info" | "crit" | "warning"; ts: number };

type Strike = {
  id: string; name: string; desc: string;
  baseDamage: number; critChance: number;
  cooldown: number; cost: number; color: string;
};

const STRIKES: Strike[] = [
  { id: "basic",      name: "Basic Strike",     desc: "Reliable attack",   baseDamage: 80,  critChance: 0.1,  cooldown: 8,  cost: 10, color: "#22d3ee" },
  { id: "focus",      name: "Focus Slash",      desc: "+15% damage",       baseDamage: 140, critChance: 0.18, cooldown: 20, cost: 20, color: "#8b5cf6" },
  { id: "discipline", name: "Discipline Break", desc: "Shreds defenses",   baseDamage: 200, critChance: 0.22, cooldown: 35, cost: 35, color: "#f59e0b" },
  { id: "nova",       name: "Awakening Nova",   desc: "Massive burst",     baseDamage: 420, critChance: 0.3,  cooldown: 60, cost: 60, color: "#f87171" },
];

const MAX_ENERGY = 5;
const LOG_MAX = 10;

// Boss narration lines
const NARRATIONS: Record<string, string[]> = {
  idle:    ["The demon stares at you with glowing eyes...", "You feel its presence weighing on your mind.", "It feeds on your procrastination."],
  hit:     ["The boss recoils!", "It screeches in pain!", "Your discipline breaks through its armor!"],
  crit:    ["DEVASTATING BLOW! The boss staggers!", "Critical strike! The demon howls!", "Your focus shatters its defenses!"],
  enraged: ["THE BOSS IS ENRAGED! Eyes burning gold!", "It will not fall without a fight!", "Darkness intensifies around the demon!"],
  low:     ["The boss is weakening... finish it!", "Victory is within reach — push harder!", "The demon trembles before your discipline!"],
};

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// Web Audio sound effects
function playSound(type: "hit" | "crit" | "swoosh") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === "crit") {
      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.05);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    }
  } catch { /* audio not supported */ }
}

export function BossBattlePanel({ productivityCompletion = 0 }: { productivityCompletion?: number }) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [localHp, setLocalHp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState(5);
  const [energyMax] = useState(5);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [narration, setNarration] = useState(getRandom(NARRATIONS.idle));
  const [striking, setStriking] = useState<string | null>(null);
  const [bossShake, setBossShake] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [damageNum, setDamageNum] = useState<{ val: number; id: number } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { push } = useToast();

  const boss = apiData?.boss ?? null;
  const progress = apiData?.progress ?? null;
  const currentHp = localHp ?? progress?.currentHp ?? 0;
  const maxHp = boss?.maxHp ?? 1;
  const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;
  const enraged = hpPct < 30 && hpPct > 0;
  const defeated = boss !== null && progress !== null && currentHp <= 0;

  const addLog = useCallback((msg: string, type: LogEntry["type"]) => {
    setLog(prev => [...prev.slice(-(LOG_MAX - 1)), { msg, type, ts: Date.now() }]);
  }, []);

  const loadBoss = useCallback(async () => {
    try {
      const res = await fetch("/api/boss/state", { cache: "no-store" });
      if (res.ok) {
        const data: ApiResponse = await res.json();
        setApiData(data);
        if (data.progress?.currentHp !== undefined) setLocalHp(data.progress.currentHp);
      }
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadBoss(); }, [loadBoss]);

  useEffect(() => {
    const unsub = subscribeToTasksUpdate(() => {
      void loadBoss();
      addLog("Task completed — passive damage dealt!", "info");
      setNarration(getRandom(NARRATIONS.hit));
    });
    return unsub;
  }, [loadBoss, addLog]);

  // Fetch energy from DB
  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const res = await fetch("/api/energy", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json() as { energy: number; energyMax: number };
          setEnergy(data.energy);
        }
      } catch { }
    };
    void fetchEnergy();
    const interval = setInterval(() => void fetchEnergy(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown tick
  useEffect(() => {
    const iv = setInterval(() => {
      setCooldowns(prev => {
        const next: Record<string, number> = {};
        let changed = false;
        for (const id in prev) {
          next[id] = Math.max(0, (prev[id] ?? 0) - 0.1);
          if (next[id] !== prev[id]) changed = true;
        }
        return changed ? next : prev;
      });
    }, 100);
    return () => clearInterval(iv);
  }, []);

  // Idle narration cycling
  useEffect(() => {
    const iv = setInterval(() => {
      if (!striking) {
        if (hpPct < 15 && hpPct > 0) setNarration(getRandom(NARRATIONS.low));
        else if (enraged) setNarration(getRandom(NARRATIONS.enraged));
        else setNarration(getRandom(NARRATIONS.idle));
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [striking, hpPct, enraged]);

  // Scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const strike = useCallback(async (s: Strike) => {
    if (!boss || striking || defeated) return;
    if (energy < 1) { addLog("No energy! Wait for regen (1 per hour).", "warning"); return; }
    if ((cooldowns[s.id] ?? 0) > 0) return;

    setStriking(s.id);
    const isCrit = Math.random() < s.critChance;
    const dmg = Math.round(s.baseDamage * (0.85 + Math.random() * 0.3) * (isCrit ? 1.8 : 1) * (enraged ? 0.85 : 1));

    // Use energy from DB
    try {
      const energyRes = await fetch("/api/energy/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      });
      if (!energyRes.ok) {
        const err = await energyRes.json() as { error: string; energy?: number };
        if (err.energy !== undefined) setEnergy(err.energy);
        addLog("Not enough energy! Wait for regen.", "warning");
        setStriking(null);
        return;
      }
      const eData = await energyRes.json() as { energy: number };
      setEnergy(eData.energy);
    } catch { setEnergy(e => Math.max(0, e - 1)); }
    setCooldowns(prev => ({ ...prev, [s.id]: s.cooldown }));
    setLocalHp(prev => Math.max(0, (prev ?? currentHp) - dmg));
    setDamageNum({ val: dmg, id: Date.now() });
    setBossShake(true); setHitFlash(true);
    setTimeout(() => { setBossShake(false); setHitFlash(false); }, 350);

    playSound(isCrit ? "crit" : "hit");

    if (isCrit) {
      addLog(`CRITICAL! ${s.name} — ${dmg} damage!`, "crit");
      setNarration(getRandom(NARRATIONS.crit));
    } else {
      addLog(`${s.name} — ${dmg} damage`, "damage");
      setNarration(getRandom(NARRATIONS.hit));
    }

    const newHp = Math.max(0, currentHp - dmg);
    if (newHp / maxHp < 0.3 && currentHp / maxHp >= 0.3) {
      setTimeout(() => setNarration(getRandom(NARRATIONS.enraged)), 800);
    }

    try {
      const res = await fetch("/api/boss/strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ damage: dmg, strikeId: s.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.progress?.currentHp !== undefined) setLocalHp(data.progress.currentHp);
        if (data.summary?.defeated || data.defeated) {
          addLog("BOSS DEFEATED! Rewards claimed!", "crit");
          setNarration("The demon shatters into shadow... You are victorious!");
          push({ title: "Boss defeated! Rewards claimed!", variant: "success" });
          setTimeout(() => void loadBoss(), 3000);
        }
      }
    } catch { /* keep local state */ }

    setStriking(null);
  }, [boss, progress, striking, defeated, energy, cooldowns, currentHp, maxHp, enraged, addLog, loadBoss, push]);

  // Remove damage number after animation
  useEffect(() => {
    if (damageNum) { const t = setTimeout(() => setDamageNum(null), 1000); return () => clearTimeout(t); }
  }, [damageNum]);

  if (loading) return (
    <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading boss...</div>
  );

  if (!boss) return (
    <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 48, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 6 }}>No Active Boss</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Complete daily habits to unlock boss encounters</div>
    </div>
  );

  const hpColor = hpPct > 50 ? "#ef4444" : hpPct > 20 ? "#f97316" : "#fbbf24";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* BOSS ARENA */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 20,
        border: `1px solid ${enraged ? "rgba(251,191,36,0.35)" : "rgba(239,68,68,0.2)"}`,
        background: "linear-gradient(160deg, #1c0810 0%, #0e0814 50%, #080b15 100%)",
        transition: "border-color 1s",
      }}>
        {/* Animated aura */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 35%, ${enraged ? "rgba(251,191,36,0.15)" : "rgba(180,0,0,0.18)"} 0%, transparent 60%)`,
          transition: "background 1s",
        }} />

        {/* Hit flash */}
        {hitFlash && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.15)", borderRadius: 20, pointerEvents: "none", zIndex: 5 }} />
        )}

        {/* Enraged badge */}
        {enraged && !defeated && (
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 10, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.5)", borderRadius: 8, padding: "4px 10px", fontSize: 10, fontWeight: 900, color: "#fbbf24" }}>
            ⚠ ENRAGED
          </div>
        )}

        {/* Header */}
        <div style={{ position: "relative", zIndex: 2, padding: "18px 22px 0", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Current Boss</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: enraged ? "#fbbf24" : "#f87171", lineHeight: 1 }}>{boss.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Level {boss.level ?? "?"} Boss{boss.weakness ? ` - Weak: ${boss.weakness}` : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Weekly Damage</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#a78bfa" }}>{(apiData?.progress as unknown as { weeklyDamage?: number })?.weeklyDamage?.toLocaleString() ?? "—"}</div>
          </div>
        </div>

        {/* Boss sprite area */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", height: 220 }}>
          {/* Damage number popup */}
          {damageNum && (
            <div key={damageNum.id} style={{
              position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
              fontSize: 28, fontWeight: 900, color: hitFlash ? "#fcd34d" : "#f87171",
              zIndex: 20, pointerEvents: "none",
              animation: "dmgPop 1s ease-out forwards",
            }}>
              -{damageNum.val}
            </div>
          )}

          {/* Boss SVG with float animation */}
          <div style={{
            transform: `${bossShake ? "translateX(-6px) scale(0.95)" : "translateX(0) scale(1)"} ${defeated ? "scale(0.7)" : ""}`,
            transition: "transform 0.15s",
            filter: defeated ? "grayscale(1) opacity(0.4)" : enraged ? "drop-shadow(0 0 16px rgba(251,191,36,0.5))" : "drop-shadow(0 0 8px rgba(220,38,38,0.35))",
            animation: defeated ? "none" : "bossFloat 3s ease-in-out infinite",
          }}>
            <svg viewBox="0 0 160 155" style={{ width: 200, height: 200 }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="bossglow" cx="50%" cy="55%" r="50%">
                  <stop offset="0%" stopColor={enraged ? "#dc2626" : "#7c0000"} stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#080b12" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <ellipse cx="80" cy="148" rx="60" ry="9" fill="url(#bossglow)"/>
              <path d="M30 88 Q20 120 24 148 Q80 142 136 148 Q140 120 130 88 Q112 72 80 70 Q48 72 30 88Z" fill="#1a0505"/>
              <path d="M36 94 Q28 122 30 146 Q80 140 130 146 Q132 122 124 94" fill="#240808"/>
              <rect x="60" y="100" width="40" height="40" rx="4" fill="#1a0505"/>
              <path d="M64 104 L96 104 L96 138 L64 138Z" fill="#230d0d"/>
              <path d="M78 104 L82 104 L82 138 L78 138Z" fill="#dc262615"/>
              <path d="M64 116 L96 116 M64 128 L96 128" stroke="#dc2626" strokeWidth="0.6" opacity=".3"/>
              <path d="M30 91 Q14 102 16 118 Q21 115 26 107 Q29 98 34 93Z" fill="#1a0505"/>
              <path d="M130 91 Q146 102 144 118 Q139 115 134 107 Q131 98 126 93Z" fill="#1a0505"/>
              <path d="M15 119 L9 113 M15 119 L11 126 M15 119 L19 125 M15 119 L21 113" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity=".85"/>
              <path d="M145 119 L151 113 M145 119 L149 126 M145 119 L141 125 M145 119 L139 113" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity=".85"/>
              <path d="M30 90 Q10 74 6 50 Q24 56 34 74 Q30 84 34 92Z" fill="#1a0505" opacity=".9"/>
              <path d="M130 90 Q150 74 154 50 Q136 56 126 74 Q130 84 126 92Z" fill="#1a0505" opacity=".9"/>
              <path d="M8 54 Q16 46 14 36" stroke="#dc2626" strokeWidth="1.2" opacity=".3" fill="none"/>
              <path d="M152 54 Q144 46 146 36" stroke="#dc2626" strokeWidth="1.2" opacity=".3" fill="none"/>
              <rect x="68" y="58" width="24" height="14" rx="5" fill="#1a0505"/>
              <ellipse cx="80" cy="40" rx="34" ry="36" fill="#0d0202"/>
              <rect x="48" y="16" width="64" height="48" rx="9" fill="#1a0505"/>
              <rect x="52" y="20" width="56" height="40" rx="6" fill="#2d1010"/>
              <rect x="58" y="28" width="44" height="24" rx="4" fill="#0d0404"/>
              <ellipse cx="70" cy="38" rx="8" ry="7" fill={enraged ? "#fbbf24" : "#dc2626"} opacity=".95"/>
              <ellipse cx="90" cy="38" rx="8" ry="7" fill={enraged ? "#fbbf24" : "#dc2626"} opacity=".95"/>
              <ellipse cx="70" cy="38" rx="4" ry="3.5" fill={enraged ? "#fef3c7" : "#fca5a5"}/>
              <ellipse cx="90" cy="38" rx="4" ry="3.5" fill={enraged ? "#fef3c7" : "#fca5a5"}/>
              <ellipse cx="71" cy="38" rx="2" ry="2.5" fill="#1a0505"/>
              <ellipse cx="91" cy="38" rx="2" ry="2.5" fill="#1a0505"/>
              <ellipse cx="70" cy="38" rx="11" ry="10" fill={enraged ? "#fbbf24" : "#dc2626"} opacity=".15"/>
              <ellipse cx="90" cy="38" rx="11" ry="10" fill={enraged ? "#fbbf24" : "#dc2626"} opacity=".15"/>
              <path d="M62 56 Q67 62 74 59 L80 63 L86 59 Q93 62 98 56" fill="#0d0404" stroke="#dc2626" strokeWidth="1.5" opacity=".75"/>
              <path d="M66 57 L68 62 M80 60 L80 65 M94 57 L92 62" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
              <path d="M50 16 L40 -2 L52 12Z" fill="#1a0505"/>
              <path d="M110 16 L120 -2 L108 12Z" fill="#1a0505"/>
              <path d="M58 12 L50 -2 L60 8Z" fill="#220808"/>
              <path d="M102 12 L110 -2 L100 8Z" fill="#220808"/>
              <circle cx="22" cy="70" r="2" fill="#dc2626" opacity=".4"/>
              <circle cx="138" cy="70" r="2" fill="#dc2626" opacity=".35"/>
              <circle cx="56" cy="10" r="1.5" fill="#dc2626" opacity=".3"/>
              <circle cx="104" cy="8" r="1.5" fill="#dc2626" opacity=".35"/>
            </svg>
          </div>

          {/* Narration text */}
          <div style={{
            position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
            maxWidth: "80%", textAlign: "center",
            fontSize: 11, fontStyle: "italic", color: "rgba(255,255,255,0.45)",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}>
            {defeated ? "The demon has been vanquished..." : narration}
          </div>
        </div>

        {/* HP Bar */}
        <div style={{ position: "relative", zIndex: 2, padding: "12px 22px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>Boss HP</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: hpColor }}>
                {currentHp.toLocaleString()} / {maxHp.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, fontWeight: 900, color: hpColor }}>{Math.round(hpPct)}%</span>
            </div>
          </div>
          <div style={{ height: 14, background: "rgba(0,0,0,0.5)", borderRadius: 7, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{
              height: "100%", borderRadius: 7, width: `${hpPct}%`,
              background: enraged ? "linear-gradient(90deg, #dc2626, #fbbf24)" : "linear-gradient(90deg, #7f1d1d, #dc2626, #ef4444)",
              transition: "width 0.5s ease, background 1s",
              boxShadow: `0 0 10px ${enraged ? "rgba(251,191,36,0.4)" : "rgba(239,68,68,0.3)"}`,
            }} />
          </div>
          {defeated && (
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 16, fontWeight: 900, color: "#fcd34d" }}>
              BOSS DEFEATED! Claim your rewards! 🏆
            </div>
          )}
        </div>
      </div>

      {/* COMBAT PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* LEFT: Strikes + Energy */}
        <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Combat Actions</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", minWidth: 40 }}>EN {Math.round(energy)}</span>
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(energy / MAX_ENERGY) * 100}%`, background: "linear-gradient(90deg, #d97706, #fbbf24)", borderRadius: 3, transition: "width 0.1s" }} />
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>/{MAX_ENERGY}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: 12 }}>
            {STRIKES.map(s => {
              const cd = cooldowns[s.id] ?? 0;
              const onCd = cd > 0;
              const noEnergy = energy <= 0; // Each strike costs 1 energy from DB
              const disabled = onCd || noEnergy || !!striking || defeated;
              return (
                <button key={s.id} type="button" disabled={disabled}
                  onClick={() => { playSound("swoosh"); void strike(s); }}
                  style={{
                    position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10, border: "1px solid",
                    borderColor: disabled ? "rgba(255,255,255,0.07)" : `${s.color}45`,
                    background: disabled ? "rgba(255,255,255,0.02)" : `${s.color}12`,
                    cursor: disabled ? "not-allowed" : "pointer", overflow: "hidden",
                  }}>
                  {onCd && (
                    <>
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, zIndex: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{cd.toFixed(1)}s</span>
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${((s.cooldown - cd) / s.cooldown) * 100}%`, background: s.color, transition: "width 0.1s", zIndex: 3 }} />
                    </>
                  )}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: disabled && !onCd ? "rgba(255,255,255,0.3)" : "#fff" }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{s.desc} - CD {s.cooldown}s</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0, zIndex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.baseDamage}+ dmg</span>
                    <span style={{ fontSize: 9, color: "#f59e0b" }}>-1 EN</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Battle log + rewards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Battle log */}
          <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>Battle Log</div>
            </div>
            <div ref={logRef} style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 5, overflowY: "auto", maxHeight: 200, minHeight: 120 }}>
              {log.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Awaiting first strike...</div>
              ) : log.map((e, i) => {
                const c = e.type === "crit" ? "#fcd34d" : e.type === "damage" ? "#f87171" : e.type === "warning" ? "#fb923c" : "#22d3ee";
                return (
                  <div key={i} style={{ fontSize: 11, color: c, display: "flex", gap: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace", fontSize: 9, flexShrink: 0 }}>
                      {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span>{e.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards */}
          <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Defeat Rewards</div>
            <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#a78bfa" }}>+{(boss.rewardExp ?? 0).toLocaleString()}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>EXP</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b" }}>+{(boss.rewardCoins ?? 0).toLocaleString()}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Coins</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{Math.round(100 - hpPct)}%</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Dealt</div>
              </div>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${100 - hpPct}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 3, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bossFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes dmgPop {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}
