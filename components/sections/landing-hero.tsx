"use client";

import { motion } from "framer-motion";
import { Flame, Shield, Star, Zap } from "lucide-react";
import Link from "next/link";

const STATS = [
  { icon: Star, value: "12K+", label: "Adventurer" },
  { icon: Zap, value: "848K", label: "Task Diselesaikan" },
  { icon: Flame, value: "96K", label: "Boss Ditaklukkan" },
];

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="hero-layout">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-copy"
        >
          <div className="hero-eyebrow">
            <span />
            Produktivitas Level RPG
          </div>

          <h1>
            Hidupmu adalah
            <strong>dungeon terkuat yang pernah ada.</strong>
          </h1>

          <p className="hero-description">
            Produktivitasmu bukan daftar tugas kosong. Ia adalah pertarungan
            melawan boss harian, kebiasaan yang naik level, dan identitas yang
            tumbuh setiap kali kamu menyelesaikan satu quest lagi.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="gold-cta">
              Pilih Kelasmu <span aria-hidden>{"->"}</span>
            </Link>
            <Link href="/login" className="violet-cta">
              Sudah punya akun
            </Link>
          </div>

          <div className="hero-stats">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="stat-card">
                <Icon aria-hidden className="stat-icon" />
                <div>
                  <p>{value}</p>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="hero-hud-wrap"
        >
          <div className="hud-frame">
            <div className="hud-corner hud-corner-left" />
            <div className="hud-corner hud-corner-right" />

            <div className="hud-top">
              <div>
                <span>Level</span>
                <strong>24</strong>
              </div>
              <div className="hud-streak">
                <span>Streak</span>
                <strong><Flame aria-hidden />26</strong>
              </div>
            </div>

            <div className="hud-bars">
              <HudBar label="EXP" value={62} tone="gold" />
              <HudBar label="HP Fokus" value={80} tone="teal" />
            </div>

            <div className="boss-card">
              <div className="boss-mark">
                <Shield aria-hidden />
              </div>
              <div className="boss-info">
                <p>Prokrastinator Agung</p>
                <span>4.800 / 10.000 HP</span>
              </div>
              <strong>Hadiah: 1x Epic</strong>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .landing-hero {
          position: relative;
          padding: 46px 0 46px;
        }

        .hero-layout {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 0.88fr) minmax(440px, 1.12fr);
          gap: 64px;
          align-items: center;
        }

        .hero-copy {
          min-width: 0;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          color: #facc15;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.26em;
          text-transform: uppercase;
        }

        .hero-eyebrow span {
          width: 18px;
          height: 2px;
          background: #facc15;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.7);
        }

        .hero-copy h1 {
          margin: 0;
          max-width: 560px;
          color: #fff;
          font-size: 54px;
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .hero-copy h1 strong {
          display: block;
          margin-top: 6px;
          color: #f6c448;
          font: inherit;
          text-shadow: 0 0 26px rgba(250, 204, 21, 0.22);
        }

        .hero-description {
          margin: 20px 0 0;
          max-width: 520px;
          color: rgba(226, 232, 240, 0.72);
          font-size: 16px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .gold-cta,
        .violet-cta {
          display: inline-flex;
          min-height: 50px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          padding: 0 28px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
        }

        .gold-cta {
          border: 1px solid rgba(255, 226, 122, 0.88);
          background: linear-gradient(180deg, #ffe178, #d99b1d);
          color: #1d1302;
          box-shadow: 0 0 24px rgba(250, 204, 21, 0.34);
        }

        .gold-cta span {
          margin-left: 8px;
        }

        .violet-cta {
          border: 1px solid rgba(139, 92, 246, 0.72);
          background: rgba(12, 10, 28, 0.68);
          color: #d8b4fe;
          box-shadow: inset 0 0 20px rgba(124, 58, 237, 0.08);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 34px;
        }

        .stat-card {
          display: flex;
          min-height: 76px;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(139, 92, 246, 0.42);
          border-radius: 11px;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.82), rgba(8, 10, 26, 0.74));
          padding: 14px 16px;
          box-shadow: inset 0 0 24px rgba(124, 58, 237, 0.08);
        }

        .stat-icon {
          width: 25px;
          height: 25px;
          color: #a855f7;
          filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.75));
        }

        .stat-card p {
          margin: 0;
          color: #facc15;
          font-family: var(--font-mono);
          font-size: 22px;
          font-weight: 900;
          line-height: 1;
        }

        .stat-card span {
          display: block;
          margin-top: 6px;
          color: rgba(203, 213, 225, 0.5);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .hero-hud-wrap {
          position: relative;
          min-width: 0;
        }

        .hero-hud-wrap::before {
          content: "";
          position: absolute;
          inset: -52px -34px;
          border-radius: 42px;
          background:
            radial-gradient(circle at 50% 8%, rgba(124, 58, 237, 0.38), transparent 42%),
            radial-gradient(circle at 20% 86%, rgba(20, 184, 166, 0.13), transparent 30%);
          filter: blur(8px);
        }

        .hud-frame {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.86);
          border-radius: 28px;
          background:
            linear-gradient(135deg, rgba(30, 27, 75, 0.88), rgba(2, 6, 23, 0.94) 52%, rgba(6, 8, 22, 0.96)),
            rgba(2, 6, 23, 0.98);
          padding: 42px;
          box-shadow:
            0 0 0 1px rgba(168, 85, 247, 0.17),
            0 0 50px rgba(124, 58, 237, 0.34),
            inset 0 0 44px rgba(124, 58, 237, 0.13);
        }

        .hud-frame::before {
          content: "";
          position: absolute;
          inset: 14px;
          border: 1px solid rgba(139, 92, 246, 0.28);
          border-radius: 20px;
          pointer-events: none;
        }

        .hud-corner {
          position: absolute;
          top: 0;
          width: 140px;
          height: 34px;
          border-top: 3px solid #8b5cf6;
          filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.95));
        }

        .hud-corner-left {
          left: 74px;
          transform: skewX(-36deg);
        }

        .hud-corner-right {
          right: 74px;
          transform: skewX(36deg);
        }

        .hud-top {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .hud-top span,
        .hud-bars span {
          color: rgba(226, 232, 240, 0.68);
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .hud-top strong {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          color: #facc15;
          font-family: var(--font-mono);
          font-size: 54px;
          font-weight: 900;
          line-height: 1;
          text-shadow: 0 0 24px rgba(250, 204, 21, 0.24);
        }

        .hud-streak {
          text-align: right;
        }

        .hud-streak strong {
          color: #f5d0fe;
          font-size: 34px;
          justify-content: flex-end;
        }

        .hud-streak svg {
          width: 28px;
          height: 28px;
          color: #fb7185;
        }

        .hud-bars {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 18px;
        }

        .hud-bar-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .hud-track {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.16);
        }

        .hud-fill {
          height: 100%;
          border-radius: inherit;
        }

        .hud-fill.gold {
          background: linear-gradient(90deg, #f59e0b, #fde047);
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.58);
        }

        .hud-fill.teal {
          background: linear-gradient(90deg, #14b8a6, #5eead4);
          box-shadow: 0 0 16px rgba(45, 212, 191, 0.5);
        }

        .boss-card {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 28px;
          border: 1px solid rgba(244, 114, 182, 0.48);
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.09), rgba(15, 23, 42, 0.74));
          padding: 18px;
        }

        .boss-mark {
          display: grid;
          width: 56px;
          height: 56px;
          flex: 0 0 auto;
          place-items: center;
          border: 1px solid rgba(250, 204, 21, 0.68);
          border-radius: 16px;
          color: #fff;
          background: rgba(15, 23, 42, 0.86);
          transform: rotate(45deg);
        }

        .boss-mark svg {
          width: 25px;
          height: 25px;
          transform: rotate(-45deg);
        }

        .boss-info {
          min-width: 0;
          flex: 1;
        }

        .boss-info p {
          margin: 0;
          color: #fff;
          font-size: 17px;
          font-weight: 900;
        }

        .boss-info span {
          display: block;
          margin-top: 6px;
          color: rgba(248, 113, 113, 0.9);
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .boss-card strong {
          color: #facc15;
          font-size: 12px;
          white-space: nowrap;
        }

        @media (max-width: 980px) {
          .hero-layout {
            grid-template-columns: 1fr;
            gap: 38px;
          }

          .hero-copy h1 {
            font-size: 44px;
          }
        }

        @media (max-width: 640px) {
          .hero-copy h1 {
            font-size: 36px;
          }

          .hero-description {
            font-size: 15px;
          }

          .hero-stats {
            grid-template-columns: 1fr;
          }

          .hud-frame {
            padding: 28px 20px;
          }

          .hud-top strong {
            font-size: 42px;
          }

          .boss-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .boss-card strong {
            width: 100%;
            padding-left: 72px;
          }
        }
      `}</style>
    </section>
  );
}

function HudBar({ label, value, tone }: { label: string; value: number; tone: "gold" | "teal" }) {
  return (
    <div>
      <div className="hud-bar-head">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="hud-track">
        <div className={`hud-fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
