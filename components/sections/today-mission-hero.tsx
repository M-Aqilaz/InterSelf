"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";

type Props = {
  username: string;
  missionTitle: string;
  dailyCompletion: number;
  streak: number;
  level: number;
  expPercent: number;
  rank: string;
  energyPercent: number;
};

const RANK_DATA: Record<string, { title: string; color: string; border: string }> = {
  BRONZE:  { title: "Initiate",       color: "var(--gold-dim)",   border: "rgba(212,168,67,0.3)"  },
  SILVER:  { title: "Awakened",       color: "var(--t2)",          border: "rgba(148,163,184,0.3)" },
  GOLD:    { title: "Vanguard",       color: "var(--gold)",        border: "rgba(212,168,67,0.5)"  },
  ELITE:   { title: "Phantom Blade",  color: "#a78bfa",            border: "rgba(167,139,250,0.4)" },
  MONARCH: { title: "Apex Sovereign", color: "var(--rose-light)",  border: "rgba(224,90,106,0.4)"  },
};

function streakNarrative(streak: number): { text: string; color: string } {
  if (streak === 0) return { text: "Konsistensimu sedang tidur. Bangkitkan.", color: "var(--rose-light)" };
  if (streak < 3)   return { text: `${streak} hari momentum. Jangan putus sekarang.`, color: "var(--gold)" };
  if (streak < 7)   return { text: `${streak} hari berturut. Satu minggu menanti.`, color: "var(--gold)" };
  if (streak < 14)  return { text: `${streak} hari. Kegelapan mulai gentar.`, color: "var(--jade-light)" };
  if (streak < 30)  return { text: `${streak} hari. Kamu berbeda dari kebanyakan.`, color: "var(--jade-light)" };
  return { text: `${streak} hari. Legenda sedang ditulis.`, color: "#a78bfa" };
}

function completionNarrative(pct: number): string {
  if (pct === 0)  return "Belum ada yang bergerak hari ini.";
  if (pct < 25)   return "Awal yang lambat — tapi sudah mulai.";
  if (pct < 50)   return "Setengah jalan menuju kemenangan harian.";
  if (pct < 75)   return "Lebih dari separuh. Kegelapan mulai surut.";
  if (pct < 100)  return "Hampir sempurna. Satu langkah lagi.";
  return "Semua misi hari ini ditaklukkan. ⚔️";
}

export function TodayMissionHero({
  username, missionTitle, dailyCompletion,
  streak, level, expPercent, rank, energyPercent,
}: Props) {
  const rankData = RANK_DATA[rank] ?? RANK_DATA.BRONZE!;
  const streakNarr = streakNarrative(streak);
  const completion = Math.max(0, Math.min(100, dailyCompletion));
  const exp = Math.max(0, Math.min(100, expPercent));
  const energy = Math.max(0, Math.min(100, energyPercent));

  const goTo = useCallback((hash: string) => {
    window.history.replaceState(null, "", hash);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        borderRadius: "18px",
        border: "1px solid var(--border)",
        background: "var(--bg-1)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient */}
      <div aria-hidden style={{ position: "absolute", top: "-40px", left: "-30px", width: "200px", height: "200px", borderRadius: "50%", background: "var(--gold)", filter: "blur(80px)", opacity: 0.04, pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-30px", right: "-20px", width: "150px", height: "150px", borderRadius: "50%", background: "var(--jade)", filter: "blur(70px)", opacity: 0.03, pointerEvents: "none" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", position: "relative" }} className="hero-inner">

        {/* LEFT */}
        <div>
          {/* Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{ height: "1px", width: "14px", background: "var(--gold-dim)" }} />
            <span style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--t4)", fontFamily: "var(--font-mono)" }}>
              Field Agent
            </span>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--t4)" }} />
            <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: rankData.color }}>
              {rankData.title}
            </span>
          </div>

          {/* Name + Level badge */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "5px" }}>
            <h1 style={{ fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 700, color: "var(--t1)", lineHeight: 1 }}>
              {username}
            </h1>
            <div
              style={{
                width: "48px", height: "48px", borderRadius: "12px",
                border: `2px solid ${rankData.border}`,
                background: "rgba(0,0,0,0.5)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "7px", color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)", lineHeight: 1 }}>LVL</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--t1)", lineHeight: 1.1, fontFamily: "var(--font-mono)" }}>{level}</span>
            </div>
          </div>

          {/* Active mission box */}
          <div
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(58,170,122,0.18)",
              background: "rgba(58,170,122,0.05)",
              padding: "10px 12px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--jade)", flexShrink: 0 }}
                className="anim-pulse-dot"
              />
              <span style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(58,170,122,0.7)", fontFamily: "var(--font-mono)" }}>
                Misi Aktif
              </span>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--t1)", lineHeight: 1.3 }}>{missionTitle}</p>
            <p style={{ fontSize: "10px", color: "var(--t3)", marginTop: "3px", fontStyle: "italic" }}>
              {completionNarrative(completion)}
            </p>
          </div>

          {/* Streak */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "16px" }}>🔥</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--t1)", fontFamily: "var(--font-mono)" }}>{streak}</span>
              <span style={{ fontSize: "11px", color: "var(--t3)" }}>hari</span>
            </div>
            <div style={{ width: "1px", height: "28px", background: "var(--border-2)" }} />
            <p style={{ fontSize: "11px", color: streakNarr.color, lineHeight: 1.4 }}>{streakNarr.text}</p>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn-rose" onClick={() => goTo("#battle")}>
              ⚔ Mulai Pertempuran
            </button>
            <button className="btn-ghost" style={{ padding: "7px 16px", fontSize: "11px" }} onClick={() => goTo("#status")}>
              ◉ Lihat Karakter
            </button>
          </div>
        </div>

        {/* RIGHT — Stats */}
        <div
          style={{
            width: "200px", flexShrink: 0,
            borderRadius: "14px",
            border: "1px solid var(--border)",
            background: "rgba(0,0,0,0.4)",
            padding: "14px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}
          className="hero-stats"
        >
          <div style={{ fontSize: "7px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--t4)", fontFamily: "var(--font-mono)" }}>
            Status Tempur
          </div>

          {/* Bars */}
          {[
            { label: "EXP",    value: exp,        colorClass: "bar-gold" },
            { label: "⚡ Energi", value: energy,  colorClass: "bar-jade" },
            { label: "Daily",  value: completion, colorClass: completion === 100 ? "bar-gold" : "bar-jade" },
          ].map((bar) => (
            <div key={bar.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--t3)", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>
                <span>{bar.label}</span>
                <span style={{ color: "var(--t1)" }}>{bar.value}%</span>
              </div>
              <div className="bar-track" style={{ height: "4px" }}>
                <div className={`bar-fill ${bar.colorClass}`} style={{ width: `${bar.value}%` }} />
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
            <div style={{ fontSize: "7px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--t4)", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
              Ancaman Aktif
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "14px" }}>💀</span>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--rose-light)" }}>Prokrastinasi Abyssal</p>
                <p style={{ fontSize: "8px", color: "var(--t4)" }}>Serang lewat War Chamber →</p>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: "8px",
              border: "1px solid rgba(212,168,67,0.18)",
              background: "rgba(212,168,67,0.05)",
              padding: "7px 9px",
            }}
          >
            <p style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(212,168,67,0.5)", fontFamily: "var(--font-mono)", marginBottom: "2px" }}>
              World Event
            </p>
            <p style={{ fontSize: "9px", fontWeight: 600, color: "rgba(212,168,67,0.8)" }}>
              Perang Konsistensi Minggu Ini Aktif
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr !important; }
          .hero-stats { width: 100% !important; }
        }
      `}</style>
    </motion.div>
  );
}