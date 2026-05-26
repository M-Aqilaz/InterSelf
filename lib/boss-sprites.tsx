export type BossSpriteProps = {
  style?: React.CSSProperties;
  className?: string;
  isHit?: boolean;
};

export function ProkrastinasiAbyssalSprite({ className = "", isHit = false, style }: BossSpriteProps) {
  return (
    <svg
      viewBox="0 0 140 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ ...style, ...(isHit ? { filter: "brightness(2) saturate(0)" } : {}) }}
    >
      <ellipse cx="70" cy="145" rx="50" ry="10" fill="#dc2626" opacity=".15"/>
      <ellipse cx="70" cy="145" rx="35" ry="6" fill="#dc2626" opacity=".1"/>
      <path d="M25 90 Q15 130 20 155 Q70 148 120 155 Q125 130 115 90 Q95 75 70 72 Q45 75 25 90Z" fill="#1a0505"/>
      <path d="M30 95 Q22 128 24 152 Q70 146 116 152 Q118 128 110 95" fill="#240808"/>
      <ellipse cx="70" cy="115" rx="22" ry="26" fill="#0d0202"/>
      <ellipse cx="70" cy="115" rx="14" ry="18" fill="#7c0000" opacity=".6"/>
      <ellipse cx="70" cy="115" rx="8" ry="10" fill="#dc2626" opacity=".8"/>
      <ellipse cx="70" cy="115" rx="4" ry="5" fill="#fca5a5" opacity=".9"/>
      <path d="M25 92 Q8 100 5 115 Q10 112 16 105" fill="#1a0505"/>
      <path d="M25 95 Q6 108 8 125 Q13 120 18 112" fill="#1a0505"/>
      <path d="M8 114 L2 122 M8 114 L5 124 M8 114 L12 122" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
      <path d="M115 92 Q132 100 135 115 Q130 112 124 105" fill="#1a0505"/>
      <path d="M115 95 Q134 108 132 125 Q127 120 122 112" fill="#1a0505"/>
      <path d="M132 114 L138 122 M132 114 L135 124 M132 114 L128 122" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
      <rect x="58" y="62" width="24" height="16" rx="6" fill="#1a0505"/>
      <ellipse cx="70" cy="46" rx="30" ry="32" fill="#0d0202"/>
      <ellipse cx="70" cy="48" rx="26" ry="27" fill="#1a0505"/>
      <path d="M55 40 L60 50 L56 58" fill="none" stroke="#dc2626" strokeWidth="1" opacity=".5"/>
      <path d="M82 38 L78 48 L83 57" fill="none" stroke="#dc2626" strokeWidth="1" opacity=".5"/>
      <ellipse cx="56" cy="44" rx="9" ry="8" fill="#0d0202"/>
      <ellipse cx="84" cy="44" rx="9" ry="8" fill="#0d0202"/>
      <ellipse cx="56" cy="44" rx="6" ry="5" fill="#dc2626"/>
      <ellipse cx="84" cy="44" rx="6" ry="5" fill="#dc2626"/>
      <ellipse cx="56" cy="44" rx="3" ry="2.5" fill="#fca5a5"/>
      <ellipse cx="84" cy="44" rx="3" ry="2.5" fill="#fca5a5"/>
      <ellipse cx="57" cy="44" rx="1.5" ry="2" fill="#1a0505"/>
      <ellipse cx="85" cy="44" rx="1.5" ry="2" fill="#1a0505"/>
      <path d="M57 60 Q70 68 83 60" fill="#0d0202" stroke="#dc2626" strokeWidth="1.5" opacity=".7"/>
      <path d="M61 61 L63 65 M70 63 L70 67 M77 61 L75 65" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" opacity=".5"/>
      <path d="M42 24 Q35 8 45 2 Q50 15 50 28" fill="#1a0505"/>
      <path d="M98 24 Q105 8 95 2 Q90 15 90 28" fill="#1a0505"/>
      <path d="M43 22 Q37 10 46 4 Q49 14 49 26" fill="#2d0a0a" opacity=".7"/>
      <path d="M97 22 Q103 10 94 4 Q91 14 91 26" fill="#2d0a0a" opacity=".7"/>
    </svg>
  );
}

export function EchoTitanSprite({ className = "", isHit = false, style }: BossSpriteProps) {
  return (
    <svg
      viewBox="0 0 140 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ ...style, ...(isHit ? { filter: "brightness(2) saturate(0)" } : {}) }}
    >
      <ellipse cx="70" cy="145" rx="55" ry="10" fill="#22d3ee" opacity=".12"/>
      <path d="M18 78 Q10 130 15 158 Q70 150 125 158 Q130 130 122 78 Q100 62 70 60 Q40 62 18 78Z" fill="#021a1a"/>
      <path d="M24 84 Q16 126 18 156 Q70 148 122 156 Q124 126 116 84" fill="#042828"/>
      <rect x="40" y="88" width="60" height="64" rx="6" fill="#021a1a"/>
      <path d="M42 90 L98 90 L98 150 L42 150Z" fill="#032020"/>
      <path d="M50 90 L50 150 M70 90 L70 150 M90 90 L90 150" stroke="#22d3ee" strokeWidth=".5" opacity=".25"/>
      <path d="M42 105 L98 105 M42 120 L98 120 M42 135 L98 135" stroke="#22d3ee" strokeWidth=".5" opacity=".2"/>
      <circle cx="70" cy="118" r="12" fill="#042828"/>
      <circle cx="70" cy="118" r="8" fill="#22d3ee" opacity=".3"/>
      <circle cx="70" cy="118" r="4" fill="#22d3ee" opacity=".7"/>
      <circle cx="70" cy="118" r="1.5" fill="#cffafe"/>
      <path d="M18 80 Q2 96 4 116 Q9 113 15 104 Q17 94 22 85Z" fill="#021a1a"/>
      <path d="M122 80 Q138 96 136 116 Q131 113 125 104 Q123 94 118 85Z" fill="#021a1a"/>
      <rect x="2" y="100" width="16" height="24" rx="4" fill="#032020"/>
      <path d="M4 104 L16 104 M4 110 L16 110 M4 116 L16 116 M4 122 L16 122" stroke="#22d3ee" strokeWidth="1" opacity=".4"/>
      <rect x="122" y="100" width="16" height="24" rx="4" fill="#032020"/>
      <path d="M124 104 L136 104 M124 110 L136 110 M124 116 L136 116 M124 122 L136 122" stroke="#22d3ee" strokeWidth="1" opacity=".4"/>
      <rect x="52" y="52" width="36" height="16" rx="4" fill="#021a1a"/>
      <path d="M54 54 L86 54 L86 66 L54 66Z" fill="#032020"/>
      <ellipse cx="70" cy="38" rx="30" ry="32" fill="#021a1a"/>
      <ellipse cx="70" cy="40" rx="27" ry="28" fill="#032020"/>
      <path d="M44 24 L70 10 L96 24 L92 40 L48 40Z" fill="#021a1a"/>
      <path d="M46 26 L70 14 L94 26 L90 38 L50 38Z" fill="#032020"/>
      <path d="M50 32 L70 18 L90 32 L87 38 L53 38Z" fill="#22d3ee" opacity=".1"/>
      <path d="M70 14 L70 38 M50 30 L90 30" stroke="#22d3ee" strokeWidth="1" opacity=".2"/>
      <rect x="42" y="34" width="56" height="20" rx="3" fill="#010d0d"/>
      <rect x="44" y="36" width="52" height="16" rx="2" fill="#021515"/>
      <ellipse cx="54" cy="44" rx="6" ry="5" fill="#22d3ee" opacity=".9"/>
      <ellipse cx="86" cy="44" rx="6" ry="5" fill="#22d3ee" opacity=".9"/>
      <ellipse cx="54" cy="44" rx="3" ry="2.5" fill="#cffafe"/>
      <ellipse cx="86" cy="44" rx="3" ry="2.5" fill="#cffafe"/>
      <path d="M58 44 L82 44" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity=".4"/>
      <path d="M60 50 Q70 56 80 50" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity=".3"/>
    </svg>
  );
}

// Map nama boss ke komponen sprite
export function getBossSprite(bossName: string): React.ComponentType<BossSpriteProps> {
  const name = bossName.toLowerCase();
  if (name.includes("prokrastinasi") || name.includes("abyssal")) return ProkrastinasiAbyssalSprite;
  if (name.includes("echo") || name.includes("titan")) return EchoTitanSprite;
  return ProkrastinasiAbyssalSprite; // default
}

export const BOSS_AURA_COLORS: Record<string, {
  ring: string; glow: string;
  hp: string;
  hpInline: string;
}> = {
  "prokrastinasi abyssal": {
    ring: "#e05a6a",
    glow: "#6b1a22",
    hp: "bar-rose",
    hpInline: "linear-gradient(90deg, #5c0000, var(--rose), #ffb0b8)",
  },
  "echo titan": {
    ring: "#22d3ee",
    glow: "#0e7490",
    hp: "bar-jade",
    hpInline: "linear-gradient(90deg, #0c4a6e, #22d3ee, #a5f3fc)",
  },
  "gravemind regent": {
    ring: "var(--jade)",
    glow: "#064e3b",
    hp: "bar-jade",
    hpInline: "linear-gradient(90deg, #064e3b, var(--jade), var(--jade-light))",
  },
  "wrath of stagnation": {
    ring: "#a78bfa",
    glow: "#4c1d95",
    hp: "bar-violet",
    hpInline: "linear-gradient(90deg, #4c1d95, #a78bfa, #ddd6fe)",
  },
  "the hollow crown": {
    ring: "var(--gold)",
    glow: "var(--gold-muted)",
    hp: "bar-gold",
    hpInline: "linear-gradient(90deg, var(--gold-muted), var(--gold), var(--gold-light))",
  },
  "chronovore": {
    ring: "#38bdf8",
    glow: "#0c4a6e",
    hp: "bar-jade",
    hpInline: "linear-gradient(90deg, #0c4a6e, #38bdf8, #bae6fd)",
  },
  "nemesis prime": {
    ring: "var(--rose)",
    glow: "var(--rose-dim)",
    hp: "bar-rose",
    hpInline: "linear-gradient(90deg, var(--rose-dim), var(--rose), #ffaaaa)",
  },
};
