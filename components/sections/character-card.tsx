"use client";

import { BookOpen, Coins, Flame, Shield, Sparkles, Swords } from "lucide-react";
import type { CSSProperties } from "react";
import { CLASS_COLORS, IroncladSprite, MerchantSprite, PhantomSprite, SageSprite } from "@/lib/character-sprites";
import { CLASS_DEFINITIONS } from "@/lib/classes";

type Props = {
  username: string;
  title: string;
  level: number;
  expIntoLevel: number;
  expForNextLevel: number;
  hp?: number;
  hpMax?: number;
  energy?: number;
  energyMax?: number;
  coins: number;
  characterClass?: string | null;
};

const CLASS_TITLES: Record<string, string> = {
  IRONCLAD: "Iron Warden",
  SAGE: "Arcane Scholar",
  PHANTOM: "Shadow Stalker",
  MERCHANT: "Coin Collector",
};

const CLASS_ICON = {
  IRONCLAD: Shield,
  SAGE: BookOpen,
  PHANTOM: Swords,
  MERCHANT: Coins,
  DEFAULT: Sparkles,
};

export function CharacterCard({
  username,
  level,
  expIntoLevel,
  expForNextLevel,
  hp = 90,
  hpMax = 100,
  energy = 5,
  energyMax = 5,
  coins,
  characterClass,
}: Props) {
  const charClass = characterClass ?? "SAGE";
  const colors = CLASS_COLORS[charClass] ?? CLASS_COLORS.DEFAULT;
  const ClassIcon = CLASS_ICON[charClass as keyof typeof CLASS_ICON] ?? CLASS_ICON.DEFAULT;
  const classDef = CLASS_DEFINITIONS.find((definition) => definition.id === charClass);
  const expPct = expForNextLevel > 0 ? Math.min(100, Math.round((expIntoLevel / expForNextLevel) * 100)) : 70;

  return (
    <div
      className="character-card-shell"
      style={{
        "--class-main": colors.primary,
        "--class-glow": colors.glow,
        "--class-accent": colors.accent,
      } as CSSProperties}
    >
      <div className="character-frame" />
      <div className="level-ribbon">LEVEL {level}</div>

      <div className="character-stage">
        <div className="rune-ring" />
        <div className="sprite-wrap">
          <AnimatedClassSprite characterClass={charClass} className="hero-sprite" />
        </div>
        <div className="sprite-shadow" />
      </div>

      <div className="character-content">
        <div className="identity-row">
          <div className="class-badge">
            <ClassIcon aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="username">{username}</p>
            <span>{CLASS_TITLES[charClass] ?? "Adventurer"}</span>
          </div>
        </div>

        {classDef && (
          <div className="passive-chip">
            <strong>{classDef.icon}</strong>
            <span>{classDef.name}</span>
            <em>{classDef.passiveBonus}</em>
          </div>
        )}

        <div className="meter-block">
          <div className="meter-head">
            <span>EXP Progress</span>
            <strong>
              {expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()} ({expPct}%)
            </strong>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${expPct}%` }} />
          </div>
        </div>

        <div className="stat-grid">
          <StatCell icon="heart" value={`${hp}/${hpMax}`} label="HP" />
          <StatCell icon="energy" value={`${energy}/${energyMax}`} label="Energy" />
          <StatCell icon="coins" value={coins.toLocaleString()} label="Coins" />
        </div>
      </div>

      <style>{`
        .character-card-shell {
          position: relative;
          min-height: 460px;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--class-accent) 44%, transparent);
          border-radius: 22px;
          background:
            radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--class-main) 30%, transparent), transparent 38%),
            linear-gradient(160deg, color-mix(in srgb, var(--class-main) 20%, #050816), #070a16 52%, #03050d);
          box-shadow:
            0 0 30px color-mix(in srgb, var(--class-glow) 24%, transparent),
            inset 0 0 34px color-mix(in srgb, var(--class-main) 12%, transparent);
          color: white;
        }

        .character-frame {
          pointer-events: none;
          position: absolute;
          inset: 12px;
          border: 1px solid color-mix(in srgb, var(--class-accent) 26%, transparent);
          border-radius: 17px;
        }

        .level-ribbon {
          position: absolute;
          left: 50%;
          top: 0;
          z-index: 5;
          transform: translateX(-50%);
          border-radius: 0 0 12px 12px;
          background: #f8fafc;
          color: #020617;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          padding: 5px 16px;
          white-space: nowrap;
        }

        .character-stage {
          position: relative;
          display: flex;
          height: 252px;
          align-items: flex-end;
          justify-content: center;
          padding-top: 32px;
        }

        .rune-ring {
          position: absolute;
          bottom: 20px;
          width: 190px;
          height: 190px;
          border: 1px solid color-mix(in srgb, var(--class-accent) 32%, transparent);
          border-radius: 999px;
          box-shadow: inset 0 0 28px color-mix(in srgb, var(--class-main) 18%, transparent);
          animation: rune-spin 12s linear infinite;
        }

        .rune-ring::before,
        .rune-ring::after {
          content: "";
          position: absolute;
          inset: 18px;
          border: 1px dashed color-mix(in srgb, var(--class-accent) 24%, transparent);
          border-radius: inherit;
        }

        .rune-ring::after {
          inset: 42px;
          border-style: solid;
        }

        .sprite-wrap {
          position: relative;
          z-index: 2;
          animation: dashboard-float 3.4s ease-in-out infinite;
          filter: drop-shadow(0 0 18px color-mix(in srgb, var(--class-glow) 70%, transparent));
        }

        .hero-sprite {
          width: 180px;
          height: 218px;
        }

        .sprite-shadow {
          position: absolute;
          bottom: 20px;
          width: 92px;
          height: 12px;
          border-radius: 999px;
          background: var(--class-main);
          opacity: 0.32;
          filter: blur(10px);
          animation: dashboard-shadow 3.4s ease-in-out infinite;
        }

        .character-content {
          position: relative;
          z-index: 2;
          padding: 8px 18px 18px;
        }

        .identity-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .class-badge {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid color-mix(in srgb, var(--class-accent) 48%, transparent);
          border-radius: 11px;
          background: color-mix(in srgb, var(--class-main) 20%, transparent);
          color: var(--class-accent);
          box-shadow: 0 0 16px color-mix(in srgb, var(--class-glow) 32%, transparent);
        }

        .class-badge svg {
          width: 18px;
          height: 18px;
        }

        .username {
          margin: 0;
          color: #fff;
          font-size: 17px;
          font-weight: 900;
          line-height: 1.1;
        }

        .identity-row span {
          display: block;
          margin-top: 3px;
          color: rgba(226, 232, 240, 0.5);
          font-size: 11px;
        }

        .passive-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          border: 1px solid color-mix(in srgb, var(--class-accent) 34%, transparent);
          border-radius: 12px;
          background: rgba(2, 6, 23, 0.42);
          padding: 9px 10px;
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
        }

        .passive-chip strong {
          color: var(--class-accent);
          font-family: var(--font-mono);
        }

        .passive-chip span {
          color: #fff;
          font-weight: 800;
        }

        .passive-chip em {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-style: normal;
        }

        .meter-block {
          margin-top: 14px;
        }

        .meter-head {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: rgba(226, 232, 240, 0.5);
          font-size: 10px;
        }

        .meter-head strong {
          color: var(--class-accent);
          font-weight: 800;
        }

        .meter-track {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          margin-top: 6px;
        }

        .meter-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--class-main), var(--class-accent));
          box-shadow: 0 0 14px color-mix(in srgb, var(--class-glow) 60%, transparent);
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 14px;
        }

        .stat-cell {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.04);
          padding: 10px 8px;
          text-align: center;
        }

        .stat-cell svg {
          width: 18px;
          height: 18px;
          margin-bottom: 4px;
          color: var(--class-accent);
        }

        .stat-cell strong {
          display: block;
          color: #fff;
          font-size: 13px;
        }

        .stat-cell span {
          display: block;
          margin-top: 2px;
          color: rgba(226, 232, 240, 0.4);
          font-family: var(--font-mono);
          font-size: 9px;
        }

        @keyframes dashboard-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes dashboard-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.32; }
          50% { transform: scaleX(0.76); opacity: 0.2; }
        }

        @keyframes rune-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AnimatedClassSprite({ characterClass, className }: { characterClass: string; className: string }) {
  switch (characterClass) {
    case "IRONCLAD":
      return <IroncladSprite className={className} />;
    case "PHANTOM":
      return <PhantomSprite className={className} />;
    case "MERCHANT":
      return <MerchantSprite className={className} />;
    case "SAGE":
    default:
      return <SageSprite className={className} />;
  }
}

function StatCell({ icon, value, label }: { icon: "heart" | "energy" | "coins"; value: string; label: string }) {
  const Icon = icon === "coins" ? Coins : icon === "energy" ? Flame : Shield;

  return (
    <div className="stat-cell">
      <Icon aria-hidden />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
