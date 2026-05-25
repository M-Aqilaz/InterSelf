import { ShareActionButtons } from "./share-buttons";
import Link from "next/link";

type Props = { params: Promise<{ token: string }> };

const RARITY_STYLES: Record<string, {
  gradient: string; border: string; glow: string;
  badge: string; label: string; star: string; orb: string;
}> = {
  COMMON:    { gradient: "from-slate-900 via-slate-800 to-slate-900",   border: "border-slate-500/50",  glow: "",                             badge: "bg-slate-500/20 text-slate-300",  label: "Common",    star: "⚪", orb: "bg-slate-500"   },
  RARE:      { gradient: "from-cyan-950 via-slate-900 to-cyan-950",     border: "border-cyan-500/60",   glow: "shadow-cyan-500/20",           badge: "bg-cyan-500/20 text-cyan-300",    label: "Langka",    star: "🔵", orb: "bg-cyan-500"    },
  EPIC:      { gradient: "from-purple-950 via-slate-900 to-purple-950", border: "border-purple-500/60", glow: "shadow-purple-500/25",         badge: "bg-purple-500/20 text-purple-300",label: "Epik",      star: "🟣", orb: "bg-purple-500"  },
  LEGENDARY: { gradient: "from-amber-950 via-slate-900 to-amber-950",   border: "border-amber-500/70",  glow: "shadow-amber-500/30",          badge: "bg-amber-500/20 text-amber-300",  label: "Legendaris",star: "🟡", orb: "bg-amber-500"   },
  MYTHIC:    { gradient: "from-rose-950 via-slate-900 to-rose-950",     border: "border-rose-500/70",   glow: "shadow-rose-500/35 shadow-2xl",badge: "bg-rose-500/20 text-rose-300",    label: "Mitik",     star: "🔴", orb: "bg-rose-500"    },
};

const ICON_MAP: Record<string, string> = {
  spark: "✦", streak: "🔥", void: "⚡", crown: "👑",
  vault: "🗝️", relic: "🌟", shield: "🛡️", sword: "⚔️",
};

const CLASS_ICON: Record<string, string> = {
  IRONCLAD: "⚔️", SAGE: "📚", PHANTOM: "🌙", MERCHANT: "💰",
};

const RANK_LABEL: Record<string, string> = {
  BRONZE: "Bronze", SILVER: "Silver", GOLD: "Gold",
  ELITE: "Elite", MONARCH: "Monarch",
};

async function getCardData(token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/achievements/card/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ShareAchievementPage({ params }: Props) {
  const { token } = await params;
  const data = await getCardData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#04060f] flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <p className="text-lg font-bold mb-1">Achievement tidak ditemukan</p>
          <p className="text-white/50 text-sm">Link mungkin sudah tidak valid</p>
          <Link href="/" className="mt-4 inline-block text-cyan-400 text-sm hover:underline">
            Kembali ke InterSelf →
          </Link>
        </div>
      </div>
    );
  }

  const { achievement, user } = data;
  const rarity = RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.RARE;
  const icon = ICON_MAP[achievement.icon] ?? "🏆";
  const classIcon = user.characterClass ? (CLASS_ICON[user.characterClass] ?? "") : "";
  const unlockedDate = new Date(achievement.unlockedAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center p-4 gap-6">

      {/* Kartu achievement */}
      <div
        id="achievement-card"
        className={`relative w-full max-w-sm overflow-hidden rounded-3xl border-2 bg-gradient-to-br ${rarity.gradient} ${rarity.border} ${rarity.glow} shadow-2xl`}
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-20 ${rarity.orb}`} />
          <div className={`absolute -bottom-12 -left-12 h-36 w-36 rounded-full blur-3xl opacity-15 ${rarity.orb}`} />
        </div>

        <div className="relative p-6">
          {/* Brand */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">INTERSELF</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${rarity.badge}`}>
              {rarity.star} {rarity.label}
            </span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-2xl border-2 ${rarity.border} bg-white/5 flex items-center justify-center text-4xl`}>
              {icon}
            </div>
          </div>

          {/* Name & desc */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-black text-white mb-1">{achievement.name}</h1>
            <p className="text-sm text-white/60 leading-relaxed">{achievement.description}</p>
          </div>

          {/* Unlock condition */}
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 mb-4 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Cara unlock</p>
            <p className="text-xs text-white/70">{achievement.unlockCondition}</p>
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-bold text-cyan-400">+{achievement.rewardExp} EXP</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-amber-400">+{achievement.rewardCoins}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-4" />

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-sm text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white">{user.username}</p>
                {classIcon && <span className="text-xs">{classIcon}</span>}
              </div>
              <p className="text-[10px] text-white/40">
                {user.title} · Lv.{user.level} · {RANK_LABEL[user.rank] ?? user.rank}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/30">Dibuka</p>
              <p className="text-[10px] text-white/50 font-semibold">{unlockedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <ShareActionButtons achievementName={achievement.name} />

      {/* Footer CTA */}
      <p className="text-xs text-white/25 text-center">
        Bergabung di <Link href="/" className="text-cyan-400 hover:underline">InterSelf</Link> dan mulai journey-mu
      </p>
    </div>
  );
}
