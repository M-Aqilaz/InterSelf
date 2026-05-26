"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { BookOpen, Check, Coins, Crosshair, Heart, Scale, Shield, Sparkles, Target } from "lucide-react";
import type { StatType } from "@prisma/client";
import { CLASS_DEFINITIONS } from "@/lib/classes";
import { CLASS_COLORS, IroncladSprite, MerchantSprite, PhantomSprite, SageSprite } from "@/lib/character-sprites";

const CLASS_META: Record<
  string,
  {
    short: string;
    roleIcon: typeof Shield;
    stats: Array<{ icon: typeof Shield; label: string }>;
    tone: "iron" | "sage" | "phantom" | "merchant";
    aura: string;
  }
> = {
  IRONCLAD: {
    short: "IR",
    roleIcon: Shield,
    stats: [
      { icon: Target, label: "Discipline" },
      { icon: Heart, label: "Fitness" },
    ],
    tone: "iron",
    aura: "radial-gradient(circle at 30% 45%, rgba(239,68,68,0.34), transparent 38%)",
  },
  SAGE: {
    short: "SG",
    roleIcon: BookOpen,
    stats: [
      { icon: Sparkles, label: "Intelligence" },
      { icon: Crosshair, label: "Focus" },
    ],
    tone: "sage",
    aura: "radial-gradient(circle at 32% 48%, rgba(34,211,238,0.34), transparent 38%)",
  },
  PHANTOM: {
    short: "PH",
    roleIcon: Crosshair,
    stats: [
      { icon: Target, label: "Consistency" },
      { icon: Crosshair, label: "Focus" },
    ],
    tone: "phantom",
    aura: "radial-gradient(circle at 30% 48%, rgba(168,85,247,0.38), transparent 38%)",
  },
  MERCHANT: {
    short: "MR",
    roleIcon: Coins,
    stats: [
      { icon: Coins, label: "Finance" },
      { icon: Scale, label: "Consistency" },
    ],
    tone: "merchant",
    aura: "radial-gradient(circle at 30% 48%, rgba(245,158,11,0.36), transparent 38%)",
  },
};

type ClassSelectionArenaProps = {
  selected: string | null;
  onSelect: (characterClass: string) => void;
  compact?: boolean;
};

export function ClassSelectionArena({ selected, onSelect, compact = false }: ClassSelectionArenaProps) {
  return (
    <div className={`class-arena ${compact ? "compact" : ""}`}>
      <div className="arena-frame" />
      <div className="class-grid">
        {CLASS_DEFINITIONS.map((definition) => (
          <ClassOption
            key={definition.id}
            definition={definition}
            selected={selected === definition.id}
            onSelect={() => onSelect(definition.id)}
          />
        ))}
      </div>

      <style>{`
        .class-arena {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(59, 130, 246, 0.42);
          border-radius: 26px;
          background:
            radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.18), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(124, 58, 237, 0.16), transparent 34%),
            linear-gradient(180deg, rgba(4, 9, 24, 0.96), rgba(2, 5, 15, 0.98));
          padding: 24px;
          box-shadow:
            0 0 0 1px rgba(147, 197, 253, 0.08),
            0 0 42px rgba(37, 99, 235, 0.18),
            inset 0 0 46px rgba(59, 130, 246, 0.08);
        }

        .class-arena.compact {
          border-radius: 22px;
          padding: 18px;
        }

        .arena-frame {
          pointer-events: none;
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(59, 130, 246, 0.22);
          border-radius: 20px;
        }

        .arena-frame::before,
        .arena-frame::after {
          content: "";
          position: absolute;
          left: 18%;
          right: 18%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.85), transparent);
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.75));
        }

        .arena-frame::before {
          top: -1px;
        }

        .arena-frame::after {
          bottom: -1px;
        }

        .class-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .class-card {
          position: relative;
          min-height: 210px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.72), rgba(2, 6, 23, 0.72));
          color: #fff;
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .class-card:hover {
          transform: translateY(-2px);
        }

        .class-card.selected {
          box-shadow: 0 0 26px var(--class-glow), inset 0 0 30px var(--class-soft);
        }

        .class-card.iron {
          --class-main: #ff4d5e;
          --class-glow: rgba(255, 77, 94, 0.56);
          --class-soft: rgba(255, 77, 94, 0.1);
          border-color: rgba(255, 77, 94, 0.55);
        }

        .class-card.sage {
          --class-main: #22d3ee;
          --class-glow: rgba(34, 211, 238, 0.58);
          --class-soft: rgba(34, 211, 238, 0.1);
          border-color: rgba(34, 211, 238, 0.62);
        }

        .class-card.phantom {
          --class-main: #c084fc;
          --class-glow: rgba(192, 132, 252, 0.55);
          --class-soft: rgba(192, 132, 252, 0.11);
          border-color: rgba(192, 132, 252, 0.58);
        }

        .class-card.merchant {
          --class-main: #fbbf24;
          --class-glow: rgba(251, 191, 36, 0.5);
          --class-soft: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.58);
        }

        .card-aura {
          position: absolute;
          inset: 0;
          opacity: 0.88;
          pointer-events: none;
        }

        .card-content {
          position: relative;
          display: grid;
          grid-template-columns: 42% 1fr;
          min-height: inherit;
        }

        .sprite-stage {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          min-width: 0;
          padding: 18px 6px 16px 14px;
        }

        .sprite-stage::before {
          content: "";
          position: absolute;
          bottom: 16px;
          width: 86px;
          height: 14px;
          border-radius: 999px;
          background: var(--class-main);
          opacity: 0.32;
          filter: blur(10px);
          animation: class-shadow 3.4s ease-in-out infinite;
        }

        .class-sprite {
          position: relative;
          z-index: 1;
          width: min(150px, 100%);
          height: 174px;
          filter: drop-shadow(0 0 16px var(--class-glow));
          animation: class-float 3.4s ease-in-out infinite;
        }

        .class-copy {
          min-width: 0;
          padding: 20px 16px 18px 6px;
        }

        .class-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .class-code {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--class-main);
        }

        .class-code strong {
          font-family: var(--font-mono);
          font-size: 42px;
          font-weight: 900;
          line-height: 0.9;
          text-shadow: 0 0 20px var(--class-glow);
        }

        .class-code svg {
          width: 28px;
          height: 28px;
          filter: drop-shadow(0 0 12px var(--class-glow));
        }

        .selected-check {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 2px solid var(--class-main);
          border-radius: 999px;
          color: var(--class-main);
          box-shadow: 0 0 18px var(--class-glow);
        }

        .class-card h3 {
          margin: 8px 0 0;
          color: var(--class-main);
          font-size: 22px;
          font-weight: 900;
          line-height: 1.05;
        }

        .class-card p {
          margin: 8px 0 0;
          color: rgba(226, 232, 240, 0.74);
          font-size: 14px;
          line-height: 1.45;
        }

        .stat-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 16px;
          margin-top: 16px;
          color: rgba(248, 250, 252, 0.86);
          font-size: 13px;
        }

        .stat-row span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .stat-row svg {
          width: 16px;
          height: 16px;
          color: var(--class-main);
        }

        .bonus-box {
          margin-top: 16px;
          border: 1px solid var(--class-main);
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.54);
          padding: 10px 12px;
          color: var(--class-main);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.3;
        }

        .class-arena.compact .class-card {
          min-height: 184px;
        }

        .class-arena.compact .class-code strong {
          font-size: 34px;
        }

        .class-arena.compact .class-sprite {
          height: 146px;
        }

        .class-arena.compact .class-card h3 {
          font-size: 19px;
        }

        .class-arena.compact .class-card p,
        .class-arena.compact .bonus-box {
          font-size: 12px;
        }

        @keyframes class-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-9px) scale(1.025); }
        }

        @keyframes class-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.28; }
          50% { transform: scaleX(0.78); opacity: 0.18; }
        }

        @media (max-width: 880px) {
          .class-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .class-arena {
            padding: 14px;
          }

          .card-content {
            grid-template-columns: 38% 1fr;
          }

          .class-code strong {
            font-size: 30px;
          }

          .class-code svg {
            width: 22px;
            height: 22px;
          }

          .class-sprite {
            height: 132px;
          }

          .class-copy {
            padding: 16px 12px 14px 2px;
          }

          .class-card h3 {
            font-size: 18px;
          }

          .class-card p,
          .bonus-box {
            font-size: 12px;
          }

          .stat-row {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

function ClassOption({
  definition,
  selected,
  onSelect,
}: {
  definition: (typeof CLASS_DEFINITIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = CLASS_META[definition.id] ?? CLASS_META.SAGE;
  const colors = CLASS_COLORS[definition.id] ?? CLASS_COLORS.DEFAULT;
  const RoleIcon = meta.roleIcon;
  const stats = Object.entries(definition.initialStats).map(([stat, value], index) => ({
    stat: stat as StatType,
    value,
    ...meta.stats[index],
  }));

  return (
    <motion.button
      type="button"
      className={`class-card ${meta.tone} ${selected ? "selected" : ""}`}
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      style={{
        "--class-main": colors.accent,
        "--class-glow": `${colors.glow}99`,
        "--class-soft": `${colors.primary}1a`,
      } as CSSProperties}
    >
      <div className="card-aura" style={{ background: meta.aura }} />
      <div className="card-content">
        <div className="sprite-stage">
          <AnimatedClassSprite characterClass={definition.id} className="class-sprite" />
        </div>

        <div className="class-copy">
          <div className="class-head">
            <div className="class-code">
              <strong>{meta.short}</strong>
              <RoleIcon aria-hidden />
            </div>
            {selected && (
              <motion.div
                className="selected-check"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Check aria-hidden size={20} />
              </motion.div>
            )}
          </div>

          <h3>{definition.name}</h3>
          <p>{definition.tagline}</p>

          <div className="stat-row">
            {stats.map(({ stat, value, icon: Icon, label }) => (
              <span key={stat}>
                <Icon aria-hidden /> +{value} {label}
              </span>
            ))}
          </div>

          <div className="bonus-box">Bonus: {definition.passiveBonus}</div>
        </div>
      </div>
    </motion.button>
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
