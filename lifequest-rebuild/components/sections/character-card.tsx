"use client";

import { CLASS_COLORS, getCharacterSprite } from "@/lib/character-sprites";

type CharacterCardProps = {
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

export function CharacterCard({
  username,
  title,
  level,
  expIntoLevel,
  expForNextLevel,
  hp = 90,
  hpMax = 100,
  energy = 5,
  energyMax = 5,
  coins,
  characterClass,
}: CharacterCardProps) {
  const charClass = characterClass ?? "SAGE";
  const colors = CLASS_COLORS[charClass] ?? CLASS_COLORS.DEFAULT;
  const Sprite = getCharacterSprite(charClass);
  const expPercent =
    expForNextLevel > 0 ? Math.min(100, Math.round((expIntoLevel / expForNextLevel) * 100)) : 70;

  const classLabels: Record<string, string> = {
    IRONCLAD: "Iron Warden",
    SAGE: "Discipline Hunter",
    PHANTOM: "Shadow Stalker",
    MERCHANT: "Coin Collector",
  };
  const classLabel = classLabels[charClass] ?? "Adventurer";

  const classIcons: Record<string, string> = {
    IRONCLAD: "🛡️",
    SAGE: "🛡️",
    PHANTOM: "🗡️",
    MERCHANT: "💰",
  };
  const classIcon = classIcons[charClass] ?? "🛡️";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border"
      style={{
        background: `linear-gradient(160deg, ${colors.primary}28 0%, #0e0a1f 55%, #080b15 100%)`,
        borderColor: `${colors.accent}30`,
      }}
    >
      {/* Glow overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${colors.primary}18 0%, transparent 60%)`,
        }}
      />

      {/* LEVEL badge */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg px-3 py-[3px] font-mono text-[9px] font-black uppercase tracking-wider text-black"
        style={{ background: "#ffffff" }}
      >
        LEVEL {level}
      </div>

      {/* Character sprite */}
      <div className="relative flex justify-center pt-6">
        <div
          className="relative flex h-[160px] w-full items-end justify-center"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, ${colors.primary}15 0%, transparent 65%)`,
          }}
        >
          <Sprite className="relative z-10 h-[140px] w-[110px]" />
          {/* Ground glow */}
          <div
            className="absolute bottom-0 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full blur-sm"
            style={{ background: `${colors.primary}25` }}
          />
        </div>
      </div>

      {/* Character info */}
      <div className="relative px-4 pb-4 pt-2">
        {/* Name + class */}
        <div className="mb-[2px] flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md text-[11px]"
            style={{ background: `${colors.primary}30` }}
          >
            {classIcon}
          </div>
          <span className="text-[15px] font-black text-white">{username}</span>
        </div>
        <div className="mb-3 text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {classLabel}
        </div>

        {/* EXP bar */}
        <div className="mb-1 flex items-center justify-between text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          <span>EXP Progress</span>
          <span>
            {expIntoLevel.toLocaleString()} / {expForNextLevel.toLocaleString()}&nbsp;
            <span className="font-bold" style={{ color: colors.accent }}>{expPercent}%</span>
          </span>
        </div>
        <div className="mb-4 h-[6px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${expPercent}%`,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
            }}
          />
        </div>

        {/* HP / Energy / Coins stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-sm">❤️</div>
            <div className="text-xs font-bold text-white">{hp}/{hpMax}</div>
            <div className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>HP</div>
          </div>
          <div className="text-center">
            <div className="text-sm">⚡</div>
            <div className="text-xs font-bold text-white">{energy}/{energyMax}</div>
            <div className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Energy</div>
          </div>
          <div className="text-center">
            <div className="text-sm">🪙</div>
            <div className="text-xs font-bold" style={{ color: "#f59e0b" }}>{coins.toLocaleString()}</div>
            <div className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Coins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
