export type SpriteProps = {
  className?: string;
};

export function SageSprite({ className = "" }: SpriteProps) {
  return (
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="60" cy="140" rx="40" ry="8" fill="#7c3aed" opacity=".15"/>
      <path d="M30 80 Q20 120 25 150 Q60 145 95 150 Q100 120 90 80 Q75 70 60 68 Q45 70 30 80Z" fill="#1e1040"/>
      <path d="M35 85 Q25 118 28 148 Q60 143 92 148 Q95 118 85 85" fill="#2a1858"/>
      <path d="M45 90 Q38 115 40 145 Q60 142 80 145 Q82 115 75 90 Q60 85 45 90Z" fill="#3b1f75" opacity=".8"/>
      <path d="M53 105 L60 95 L67 105 L60 115Z" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity=".8"/>
      <circle cx="60" cy="105" r="3" fill="#c4b5fd" opacity=".9"/>
      <path d="M30 85 Q15 95 18 110 Q22 108 28 100 Q30 92 35 88Z" fill="#1e1040"/>
      <path d="M90 85 Q105 95 102 110 Q98 108 92 100 Q90 92 85 88Z" fill="#1e1040"/>
      <circle cx="17" cy="112" r="7" fill="#2a1858"/>
      <circle cx="17" cy="112" r="4" fill="#7c3aed" opacity=".7"/>
      <circle cx="103" cy="112" r="7" fill="#2a1858"/>
      <circle cx="103" cy="112" r="4" fill="#22d3ee" opacity=".7"/>
      <rect x="53" y="60" width="14" height="14" rx="4" fill="#2a1858"/>
      <ellipse cx="60" cy="50" rx="22" ry="24" fill="#1e1040"/>
      <ellipse cx="60" cy="52" rx="19" ry="20" fill="#251450"/>
      <path d="M38 38 Q60 20 82 38 Q75 30 60 28 Q45 30 38 38Z" fill="#120b2e"/>
      <ellipse cx="60" cy="52" rx="14" ry="10" fill="#0d0820" opacity=".8"/>
      <ellipse cx="53" cy="50" rx="4" ry="3" fill="#7c3aed"/>
      <ellipse cx="67" cy="50" rx="4" ry="3" fill="#7c3aed"/>
      <ellipse cx="53" cy="50" rx="2" ry="1.5" fill="#c4b5fd"/>
      <ellipse cx="67" cy="50" rx="2" ry="1.5" fill="#c4b5fd"/>
      <path d="M36 42 Q38 18 60 14 Q82 18 84 42 Q80 30 60 27 Q40 30 36 42Z" fill="#0f0825"/>
      <path d="M36 42 Q30 55 32 65 Q38 68 44 65 Q40 58 42 48Z" fill="#0f0825"/>
      <path d="M84 42 Q90 55 88 65 Q82 68 76 65 Q80 58 78 48Z" fill="#0f0825"/>
    </svg>
  );
}

export function IroncladSprite({ className = "" }: SpriteProps) {
  return (
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="60" cy="142" rx="42" ry="9" fill="#dc2626" opacity=".12"/>
      <path d="M25 85 Q15 128 20 152 Q60 148 100 152 Q105 128 95 85 Q78 72 60 70 Q42 72 25 85Z" fill="#1c0a0a"/>
      <path d="M32 92 Q24 124 26 150 Q60 146 94 150 Q96 124 88 92" fill="#2d1010"/>
      <rect x="40" y="95" width="40" height="50" rx="4" fill="#1a0808"/>
      <path d="M42 98 L78 98 L78 142 L42 142Z" fill="#230d0d"/>
      <path d="M55 100 L65 100 L65 140 L55 140Z" fill="#dc262620"/>
      <path d="M42 108 L78 108 M42 120 L78 120 M42 132 L78 132" stroke="#dc2626" strokeWidth="1" opacity=".4"/>
      <path d="M55 100 L65 140" stroke="#dc2626" strokeWidth=".5" opacity=".3"/>
      <path d="M25 88 Q10 98 12 116 Q16 113 22 105 Q25 96 30 91Z" fill="#1c0a0a"/>
      <path d="M95 88 Q110 98 108 116 Q104 113 98 105 Q95 96 90 91Z" fill="#1c0a0a"/>
      <rect x="8" y="106" width="14" height="20" rx="4" fill="#230d0d"/>
      <path d="M10 108 L20 108 M10 114 L20 114 M10 120 L20 120" stroke="#dc2626" strokeWidth="1" opacity=".5"/>
      <rect x="98" y="106" width="14" height="20" rx="4" fill="#230d0d"/>
      <path d="M100 108 L110 108 M100 114 L110 114 M100 120 L110 120" stroke="#dc2626" strokeWidth="1" opacity=".5"/>
      <rect x="48" y="58" width="24" height="18" rx="3" fill="#1c0a0a"/>
      <path d="M50 60 L70 60 L70 74 L50 74Z" fill="#230d0d"/>
      <ellipse cx="60" cy="44" rx="26" ry="28" fill="#1c0a0a"/>
      <rect x="36" y="26" width="48" height="38" rx="6" fill="#230d0d"/>
      <rect x="38" y="28" width="44" height="34" rx="4" fill="#2d1010"/>
      <rect x="44" y="36" width="32" height="20" rx="3" fill="#0d0404"/>
      <ellipse cx="52" cy="46" rx="5" ry="4" fill="#dc2626" opacity=".9"/>
      <ellipse cx="68" cy="46" rx="5" ry="4" fill="#dc2626" opacity=".9"/>
      <ellipse cx="52" cy="46" rx="2.5" ry="2" fill="#fca5a5"/>
      <ellipse cx="68" cy="46" rx="2.5" ry="2" fill="#fca5a5"/>
      <path d="M44 20 L52 8 L56 20Z" fill="#1c0a0a"/>
      <path d="M76 20 L68 8 L64 20Z" fill="#1c0a0a"/>
      <path d="M36 32 L30 22 L40 28Z" fill="#1c0a0a"/>
      <path d="M84 32 L90 22 L80 28Z" fill="#1c0a0a"/>
    </svg>
  );
}

export function PhantomSprite({ className = "" }: SpriteProps) {
  return (
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="60" cy="142" rx="38" ry="7" fill="#6d28d9" opacity=".1"/>
      <path d="M28 82 Q16 125 22 155 Q60 148 98 155 Q104 125 92 82 Q76 68 60 66 Q44 68 28 82Z" fill="#0d0818" opacity=".9"/>
      <path d="M34 88 Q24 120 26 152 Q60 146 94 152 Q96 120 86 88" fill="#140d24" opacity=".8"/>
      <ellipse cx="60" cy="118" rx="20" ry="28" fill="#0a0615" opacity=".95"/>
      <ellipse cx="60" cy="115" rx="10" ry="14" fill="#6d28d9" opacity=".3"/>
      <ellipse cx="60" cy="112" rx="5" ry="7" fill="#8b5cf6" opacity=".5"/>
      <path d="M28 85 Q12 98 15 115 Q19 112 25 103 Q27 93 32 89Z" fill="#0d0818" opacity=".85"/>
      <path d="M92 85 Q108 98 105 115 Q101 112 95 103 Q93 93 88 89Z" fill="#0d0818" opacity=".85"/>
      <circle cx="14" cy="116" r="6" fill="#140d24"/>
      <circle cx="14" cy="116" r="3" fill="#8b5cf6" opacity=".6"/>
      <circle cx="106" cy="116" r="6" fill="#140d24"/>
      <circle cx="106" cy="116" r="3" fill="#a78bfa" opacity=".6"/>
      <path d="M22 150 Q30 160 40 162 Q38 155 34 150Z" fill="#0d0818" opacity=".9"/>
      <path d="M98 150 Q90 160 80 162 Q82 155 86 150Z" fill="#0d0818" opacity=".9"/>
      <path d="M48 150 Q54 165 60 167 Q66 165 72 150Z" fill="#0d0818" opacity=".9"/>
      <rect x="52" y="58" width="16" height="14" rx="5" fill="#0d0818"/>
      <ellipse cx="60" cy="46" rx="24" ry="26" fill="#0d0818" opacity=".95"/>
      <ellipse cx="60" cy="48" rx="20" ry="22" fill="#140d24"/>
      <ellipse cx="60" cy="50" rx="13" ry="10" fill="#0a0615" opacity=".8"/>
      <ellipse cx="51" cy="48" rx="5" ry="4" fill="#8b5cf6"/>
      <ellipse cx="69" cy="48" rx="5" ry="4" fill="#8b5cf6"/>
      <ellipse cx="51" cy="48" rx="2.5" ry="2" fill="#ddd6fe"/>
      <ellipse cx="69" cy="48" rx="2.5" ry="2" fill="#ddd6fe"/>
      <path d="M48 58 Q54 62 60 60 Q66 62 72 58" fill="none" stroke="#6d28d9" strokeWidth="1.5" opacity=".5"/>
      <path d="M38 38 Q40 14 60 10 Q80 14 82 38 Q76 26 60 24 Q44 26 38 38Z" fill="#0a0615"/>
      <path d="M36 40 Q28 56 30 68 Q36 70 42 67 Q38 60 40 48Z" fill="#0a0615"/>
      <path d="M84 40 Q92 56 90 68 Q84 70 78 67 Q82 60 80 48Z" fill="#0a0615"/>
      <circle cx="30" cy="72" r="2" fill="#8b5cf6" opacity=".4"/>
      <circle cx="90" cy="68" r="1.5" fill="#a78bfa" opacity=".3"/>
    </svg>
  );
}

export function MerchantSprite({ className = "" }: SpriteProps) {
  return (
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="60" cy="142" rx="42" ry="8" fill="#d97706" opacity=".12"/>
      <path d="M28 82 Q18 124 22 152 Q60 146 98 152 Q102 124 92 82 Q76 70 60 68 Q44 70 28 82Z" fill="#1c1204"/>
      <path d="M34 88 Q26 120 28 150 Q60 144 92 150 Q94 120 86 88" fill="#2d1e06"/>
      <path d="M42 95 L78 95 L80 148 L40 148Z" fill="#1a1203"/>
      <path d="M44 97 L76 97 L78 146 L42 146Z" fill="#231804"/>
      <path d="M48 95 L72 95 L72 145 L48 145Z" fill="#d97706" opacity=".12"/>
      <path d="M44 112 L76 112 M44 128 L76 128" stroke="#d97706" strokeWidth="1.5" opacity=".3"/>
      <circle cx="60" cy="104" r="5" fill="#d97706" opacity=".5"/>
      <circle cx="60" cy="104" r="2.5" fill="#fcd34d" opacity=".7"/>
      <path d="M28 85 Q13 97 15 114 Q19 111 24 103 Q27 94 32 88Z" fill="#1c1204"/>
      <path d="M92 85 Q107 97 105 114 Q101 111 96 103 Q93 94 88 88Z" fill="#1c1204"/>
      <rect x="10" y="103" width="14" height="18" rx="3" fill="#2d1e06"/>
      <circle cx="17" cy="112" r="5" fill="#d97706" opacity=".4"/>
      <rect x="96" y="103" width="14" height="18" rx="3" fill="#2d1e06"/>
      <circle cx="103" cy="112" r="5" fill="#d97706" opacity=".4"/>
      <rect x="52" y="60" width="16" height="14" rx="4" fill="#1c1204"/>
      <ellipse cx="60" cy="46" rx="25" ry="27" fill="#1c1204"/>
      <ellipse cx="60" cy="48" rx="22" ry="23" fill="#2d1e06"/>
      <ellipse cx="60" cy="50" rx="14" ry="11" fill="#120d02" opacity=".8"/>
      <ellipse cx="51" cy="47" rx="5" ry="4.5" fill="#d97706" opacity=".9"/>
      <ellipse cx="69" cy="47" rx="5" ry="4.5" fill="#d97706" opacity=".9"/>
      <ellipse cx="51" cy="47" rx="2.5" ry="2" fill="#fcd34d"/>
      <ellipse cx="69" cy="47" rx="2.5" ry="2" fill="#fcd34d"/>
      <path d="M54 58 Q60 64 66 58" fill="none" stroke="#d97706" strokeWidth="2" opacity=".7" strokeLinecap="round"/>
      <path d="M38 30 L60 12 L82 30 L78 44 L42 44Z" fill="#1c1204"/>
      <path d="M40 32 L60 16 L80 32 L76 42 L44 42Z" fill="#2d1e06"/>
      <path d="M44 36 L60 22 L76 36 L73 41 L47 41Z" fill="#d97706" opacity=".2"/>
      <path d="M60 16 L60 42" stroke="#d97706" strokeWidth="1.5" opacity=".3"/>
      <path d="M44 38 L76 38" stroke="#d97706" strokeWidth="1" opacity=".2"/>
      <circle cx="60" cy="12" r="4" fill="#d97706" opacity=".8"/>
      <circle cx="60" cy="12" r="2" fill="#fcd34d"/>
    </svg>
  );
}

export function getCharacterSprite(characterClass: string | null): React.ComponentType<SpriteProps> {
  switch (characterClass) {
    case "IRONCLAD": return IroncladSprite;
    case "SAGE":     return SageSprite;
    case "PHANTOM":  return PhantomSprite;
    case "MERCHANT": return MerchantSprite;
    default:         return SageSprite;
  }
}

export const CLASS_COLORS: Record<string, { primary: string; glow: string; accent: string }> = {
  IRONCLAD: { primary: "#dc2626", glow: "#dc2626", accent: "#fca5a5" },
  SAGE:     { primary: "#7c3aed", glow: "#7c3aed", accent: "#c4b5fd" },
  PHANTOM:  { primary: "#6d28d9", glow: "#8b5cf6", accent: "#ddd6fe" },
  MERCHANT: { primary: "#d97706", glow: "#d97706", accent: "#fcd34d" },
  DEFAULT:  { primary: "#7c3aed", glow: "#7c3aed", accent: "#c4b5fd" },
};
