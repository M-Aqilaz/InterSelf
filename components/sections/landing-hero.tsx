"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STATS = [
  { value: "12K+", label: "Adventurer" },
  { value: "840K", label: "Task Selesai" },
  { value: "96K",  label: "Boss Dikalahkan" },
];

export function LandingHero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "64px 0 48px",
      }}
    >
      {/* Ambient blobs */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: "-100px", left: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "var(--gold)", filter: "blur(120px)",
          opacity: 0.05, pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: "-60px", right: "5%",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "var(--jade)", filter: "blur(100px)",
          opacity: 0.04, pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
          position: "relative",
        }}
        className="hero-grid"
      >
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: "0" }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ width: "20px", height: "1px", background: "var(--gold)" }} />
            <span
              style={{
                fontSize: "10px", fontWeight: 600,
                letterSpacing: "0.35em", textTransform: "uppercase",
                color: "var(--gold)", fontFamily: "var(--font-mono)",
              }}
            >
              Pengembangan Diri · RPG
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "var(--t1)",
              marginBottom: "16px",
            }}
          >
            Hidupmu adalah<br />
            <span className="text-gold-gradient">
              dungeon terkuat<br />yang pernah ada.
            </span>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "15px", color: "var(--t2)",
              lineHeight: 1.75, maxWidth: "440px",
              marginBottom: "28px",
            }}
          >
            Prokrastinasi adalah boss yang menunggu diserang. Setiap
            kebiasaan yang kamu bangun adalah serangan ke arahnya.
            InterSelf mengubah pengembangan diri menjadi sistem RPG
            dengan konsekuensi nyata.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "36px" }}>
            <Link href="/register" className="btn-gold">
              Pilih Kelasmu →
            </Link>
            <Link href="/login" className="btn-ghost">
              Sudah punya akun
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-1)",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "22px", fontWeight: 700,
                    color: "var(--gold)", fontFamily: "var(--font-mono)",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "9px", textTransform: "uppercase",
                    letterSpacing: "0.18em", color: "var(--t3)",
                    marginTop: "3px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — HUD card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            style={{
              borderRadius: "20px",
              border: "1px solid var(--border-2)",
              background: "rgba(12,16,24,0.90)",
              backdropFilter: "blur(24px)",
              padding: "22px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle gold shimmer */}
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg,rgba(212,168,67,0.04),transparent 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Level + Streak row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px", position: "relative" }}>
              <div>
                <div style={{ fontSize: "8px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "var(--font-mono)" }}>
                  Level
                </div>
                <div style={{ fontSize: "42px", fontWeight: 700, color: "var(--gold)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>
                  24
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "8px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "var(--font-mono)" }}>
                  Streak
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--t1)", fontFamily: "var(--font-mono)" }}>
                  🔥 26
                </div>
              </div>
            </div>

            {/* Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {[
                { label: "EXP", value: 68, colorClass: "bar-gold" },
                { label: "Daily Progress", value: 86, colorClass: "bar-jade" },
              ].map((bar) => (
                <div key={bar.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--t3)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
                    <span>{bar.label}</span><span>{bar.value}%</span>
                  </div>
                  <div className="bar-track" style={{ height: "5px" }}>
                    <div className={`bar-fill ${bar.colorClass}`} style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Active boss */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                borderRadius: "12px", border: "1px solid rgba(224,90,106,0.22)",
                background: "rgba(224,90,106,0.06)", padding: "12px 14px",
              }}
            >
              <span style={{ fontSize: "20px" }}>💀</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--t1)" }}>
                  Prokrastinasi Abyssal
                </div>
                <div style={{ fontSize: "9px", color: "var(--rose)", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
                  HP: 4,820 / 8,000
                </div>
              </div>
              <div style={{ fontSize: "9px", color: "var(--gold)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                Pulih: 1j 20m
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile hero grid fix */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}