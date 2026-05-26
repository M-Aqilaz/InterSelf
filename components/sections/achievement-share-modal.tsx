"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AchievementCardData = {
  achievement: {
    name: string;
    description: string;
    icon: string;
    rarity: string;
    rewardExp: number;
    rewardCoins: number;
    unlockCondition: string;
    unlockedAt: string;
  };
  user: {
    username: string;
    level: number;
    rank: string;
    title: string;
    characterClass: string | null;
  };
  shareUrl: string;
};

const RARITY_STYLES: Record<string, {
  gradient: string; border: string; glow: string;
  badge: string; label: string; star: string; orb: string;
}> = {
  COMMON:    { gradient: "from-slate-900 via-slate-800 to-slate-900",   border: "border-slate-500/50",  glow: "",                             badge: "bg-slate-500/20 text-slate-300",  label: "Common",    star: "⚪", orb: "bg-slate-500"  },
  RARE:      { gradient: "from-cyan-950 via-slate-900 to-cyan-950",     border: "border-cyan-500/60",   glow: "shadow-cyan-500/30",           badge: "bg-cyan-500/20 text-cyan-300",    label: "Langka",    star: "🔵", orb: "bg-cyan-500"   },
  EPIC:      { gradient: "from-purple-950 via-slate-900 to-purple-950", border: "border-purple-500/60", glow: "shadow-purple-500/30",         badge: "bg-purple-500/20 text-purple-300",label: "Epik",      star: "🟣", orb: "bg-purple-500" },
  LEGENDARY: { gradient: "from-amber-950 via-slate-900 to-amber-950",   border: "border-amber-500/70",  glow: "shadow-amber-500/40",          badge: "bg-amber-500/20 text-amber-300",  label: "Legendaris",star: "🟡", orb: "bg-amber-500"  },
  MYTHIC:    { gradient: "from-rose-950 via-slate-900 to-rose-950",     border: "border-rose-500/70",   glow: "shadow-rose-500/40 shadow-2xl",badge: "bg-rose-500/20 text-rose-300",    label: "Mitik",     star: "🔴", orb: "bg-rose-500"   },
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

type Props = {
  achievementId: number | null;
  onClose: () => void;
};

export function AchievementShareModal({ achievementId, onClose }: Props) {
  const [data, setData] = useState<AchievementCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch data saat achievementId berubah
  useEffect(() => {
    if (!achievementId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/achievements/${achievementId}/share`, { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Gagal memuat kartu");

        // Ambil data card via token
        const cardRes = await fetch(`/api/achievements/card/${json.shareToken}`);
        const cardJson = await cardRes.json();
        if (!cardRes.ok) throw new Error(cardJson.error ?? "Gagal memuat kartu");

        setData({ ...cardJson, shareUrl: json.shareUrl });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat kartu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setData(null);
      setError(null);
      setLoading(false);
    };
  }, [achievementId]);

  // Tutup saat tekan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current);
      const link = document.createElement("a");
      link.download = `${(data?.achievement.name ?? "achievement").replace(/\s+/g, "-").toLowerCase()}-interself.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [data]);

  const shareToTwitter = useCallback(() => {
    if (!data) return;
    const text = encodeURIComponent(
      `Gw baru unlock achievement "${data.achievement.name}" di InterSelf! 🏆\n\nLevel up produktivitasmu juga →`
    );
    const url = encodeURIComponent(data.shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }, [data]);

  const copyLink = useCallback(async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [data]);

  const isOpen = achievementId !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm flex flex-col gap-3">

              {/* Close button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="rounded-3xl border border-white/10 bg-[#0d1220] p-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-3"
                  />
                  <p className="text-sm text-white/40">Memuat kartu achievement...</p>
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                  <p className="text-2xl mb-2">⚠️</p>
                  <p className="text-sm font-semibold text-red-400 mb-1">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 text-xs text-white/40 hover:text-white/60"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* Card */}
              {data && !loading && (() => {
                const { achievement, user } = data;
                const rarity = RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.RARE;
                const icon = ICON_MAP[achievement.icon] ?? "🏆";
                const classIcon = user.characterClass ? (CLASS_ICON[user.characterClass] ?? "") : "";
                const unlockedDate = new Date(achievement.unlockedAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                });

                return (
                  <>
                    {/* Achievement card (yang didownload) */}
                    <div
                      ref={cardRef}
                      className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br ${rarity.gradient} ${rarity.border} ${rarity.glow} shadow-2xl`}
                    >
                      {/* Decorative orbs */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-20 ${rarity.orb}`} />
                        <div className={`absolute -bottom-12 -left-12 h-36 w-36 rounded-full blur-3xl opacity-15 ${rarity.orb}`} />
                      </div>

                      <div className="relative p-5">
                        {/* Brand + rarity */}
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">INTERSELF</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${rarity.badge}`}>
                            {rarity.star} {rarity.label}
                          </span>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-3">
                          <div className={`w-16 h-16 rounded-2xl border-2 ${rarity.border} bg-white/5 flex items-center justify-center text-3xl`}>
                            {icon}
                          </div>
                        </div>

                        {/* Name & desc */}
                        <div className="text-center mb-3">
                          <h2 className="text-lg font-black text-white mb-1">{achievement.name}</h2>
                          <p className="text-xs text-white/60 leading-relaxed">{achievement.description}</p>
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1">
                            <span className="text-xs">⚡</span>
                            <span className="text-xs font-bold text-cyan-400">+{achievement.rewardExp} EXP</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1">
                            <span className="text-xs">🪙</span>
                            <span className="text-xs font-bold text-amber-400">+{achievement.rewardCoins}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10 mb-3" />

                        {/* User info */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-xs text-white flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-bold text-white truncate">{user.username}</p>
                              {classIcon && <span className="text-xs flex-shrink-0">{classIcon}</span>}
                            </div>
                            <p className="text-[10px] text-white/40">
                              {user.title} · Lv.{user.level} · {RANK_LABEL[user.rank] ?? user.rank}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[9px] text-white/30">Dibuka</p>
                            <p className="text-[10px] text-white/50 font-semibold">{unlockedDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={downloadCard}
                        disabled={downloading}
                        className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                      >
                        {downloading ? "Membuat gambar..." : "⬇️ Download Kartu"}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={shareToTwitter}
                          className="rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                        >
                          𝕏 Twitter/X
                        </button>
                        <button
                          onClick={copyLink}
                          className="rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/8 transition-all"
                        >
                          {copied ? "✓ Disalin!" : "🔗 Salin link"}
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
