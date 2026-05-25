import { CharacterClass, StatType } from "@prisma/client";

export type ClassDefinition = {
  id: CharacterClass;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  color: string;
  borderColor: string;
  glowColor: string;
  badgeStyle: string;
  initialStats: Partial<Record<StatType, number>>;
  passiveBonus: string;
  passiveBonusKey: ClassPassiveBonusKey;
};

export type ClassPassiveBonusKey =
  | "exp_hard_legendary"
  | "exp_study_focus"
  | "streak_protection"
  | "coin_all";

export const CLASS_DEFINITIONS: ClassDefinition[] = [
  {
    id: CharacterClass.IRONCLAD,
    name: "Ironclad",
    icon: "IR",
    tagline: "Disiplin absolut. Tidak kenal lelah.",
    description:
      "Karakter dengan fisik dan mental paling tangguh. Setiap tantangan berat adalah makanan sehari-hari. Pilih ini kalau kamu mau fokus ke produktivitas fisik dan kerja keras.",
    color: "text-red-400",
    borderColor: "border-red-500/40",
    glowColor: "shadow-red-500/20",
    badgeStyle: "bg-red-500/15 text-red-400 border border-red-500/30",
    initialStats: {
      [StatType.DISCIPLINE]: 20,
      [StatType.FITNESS]: 15,
    },
    passiveBonus: "+15% EXP dari task HARD & LEGENDARY",
    passiveBonusKey: "exp_hard_legendary",
  },
  {
    id: CharacterClass.SAGE,
    name: "Sage",
    icon: "SG",
    tagline: "Penguasa ilmu. Setiap buku adalah senjata.",
    description:
      "Karakter dengan kecerdasan tertinggi. Fokus pada pembelajaran, riset, dan pengembangan pikiran. Cocok untuk pelajar, developer, atau siapa saja yang hidupnya diisi oleh ilmu.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/20",
    badgeStyle: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    initialStats: {
      [StatType.INTELLIGENCE]: 20,
      [StatType.FOCUS]: 15,
    },
    passiveBonus: "+15% EXP dari task STUDY & FOCUS",
    passiveBonusKey: "exp_study_focus",
  },
  {
    id: CharacterClass.PHANTOM,
    name: "Phantom",
    icon: "PH",
    tagline: "Konsisten dalam bayangan. Selalu ada.",
    description:
      "Karakter yang kekuatannya ada di konsistensi jangka panjang. Tidak paling kuat dalam satu hari, tapi tidak pernah berhenti. Streak adalah nyawa kelas ini.",
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
    badgeStyle: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    initialStats: {
      [StatType.CONSISTENCY]: 20,
      [StatType.FOCUS]: 10,
    },
    passiveBonus: "Streak putus hanya potong 50% (tidak reset ke 0)",
    passiveBonusKey: "streak_protection",
  },
  {
    id: CharacterClass.MERCHANT,
    name: "Merchant",
    icon: "MR",
    tagline: "Setiap misi adalah investasi.",
    description:
      "Karakter yang mengoptimalkan semua reward. Coin adalah prioritas, dan setiap task adalah peluang profit. Cocok untuk yang suka progression material dan ekonomi game.",
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/20",
    badgeStyle: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    initialStats: {
      [StatType.FINANCE]: 20,
      [StatType.CONSISTENCY]: 10,
    },
    passiveBonus: "+20% Coins dari semua task",
    passiveBonusKey: "coin_all",
  },
];

export function getClassDefinition(cls: CharacterClass): ClassDefinition {
  const def = CLASS_DEFINITIONS.find((c) => c.id === cls);
  if (!def) throw new Error(`Unknown class: ${cls}`);
  return def;
}

export function getClassPassiveMultipliers(
  cls: CharacterClass,
  taskCategory: string,
  taskDifficulty: string
): { expMultiplier: number; coinMultiplier: number } {
  const def = getClassDefinition(cls);

  switch (def.passiveBonusKey) {
    case "exp_hard_legendary":
      return {
        expMultiplier: ["HARD", "LEGENDARY"].includes(taskDifficulty) ? 1.15 : 1,
        coinMultiplier: 1,
      };

    case "exp_study_focus":
      return {
        expMultiplier: ["STUDY", "FOCUS"].includes(taskCategory) ? 1.15 : 1,
        coinMultiplier: 1,
      };

    case "coin_all":
      return {
        expMultiplier: 1,
        coinMultiplier: 1.2,
      };

    case "streak_protection":
    default:
      return { expMultiplier: 1, coinMultiplier: 1 };
  }
}
