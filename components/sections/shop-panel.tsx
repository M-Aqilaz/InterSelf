"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ShopItem = {
  id: number;
  name: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "RELIC";
  description: string;
  effect: string;
  price: number;
  owned: number;
  canAfford: boolean;
};

type ShopData = {
  items: ShopItem[];
  userCoins: number;
};

const RARITY_STYLES: Record<string, { border: string; badge: string; glow: string; label: string; icon: string }> = {
  COMMON:    { border: "border-white/20",       badge: "bg-white/10 text-white/60",          glow: "",                       label: "Biasa",    icon: "🪨" },
  RARE:      { border: "border-cyan-500/40",    badge: "bg-cyan-500/15 text-cyan-400",       glow: "hover:shadow-cyan-500/10",     label: "Langka",   icon: "💎" },
  EPIC:      { border: "border-purple-500/50",  badge: "bg-purple-500/15 text-purple-300",   glow: "hover:shadow-purple-500/15",   label: "Epik",     icon: "✨" },
  LEGENDARY: { border: "border-amber-500/60",   badge: "bg-amber-500/15 text-amber-300",     glow: "hover:shadow-amber-500/20",    label: "Legendaris", icon: "👑" },
  RELIC:     { border: "border-rose-500/60",    badge: "bg-rose-500/15 text-rose-300",       glow: "hover:shadow-rose-500/20",     label: "Relic",    icon: "🌟" },
};

const FILTER_TABS = ["Semua", "COMMON", "RARE", "EPIC", "LEGENDARY"] as const;

export function ShopPanel() {
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null);
  const [filter, setFilter] = useState<typeof FILTER_TABS[number]>("Semua");

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const buyItem = useCallback(async (item: ShopItem) => {
    if (buying !== null) return;
    setBuying(item.id);

    const res = await fetch("/api/shop/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, quantity: 1 }),
    });

    const result = await res.json();

    if (res.ok) {
      setNotification({ msg: `${item.name} berhasil dibeli!`, ok: true });
      setData((prev) =>
        prev
          ? {
              userCoins: result.remainingCoins,
              items: prev.items.map((i) =>
                i.id === item.id
                  ? { ...i, owned: i.owned + 1, canAfford: result.remainingCoins >= i.price }
                  : { ...i, canAfford: result.remainingCoins >= i.price }
              ),
            }
          : null
      );
    } else {
      setNotification({ msg: result.error ?? "Gagal membeli item", ok: false });
    }

    setTimeout(() => setNotification(null), 3000);
    setBuying(null);
  }, [buying]);

  const filteredItems = data?.items.filter(
    (i) => filter === "Semua" || i.rarity === filter
  ) ?? [];

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/40 text-center text-sm">
        Memuat toko...
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#04060f] via-[#07021a] to-[#120823] p-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Toko</p>
          <h2 className="text-2xl font-black">Emporium</h2>
          <p className="text-sm text-white/50 mt-0.5">Belanjakan coin kamu untuk item dan boost</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2">
          <span className="text-lg">🪙</span>
          <div>
            <p className="text-[10px] text-amber-300/60 uppercase tracking-wider">Coins kamu</p>
            <p className="text-xl font-black text-amber-300">{data?.userCoins.toLocaleString("id-ID") ?? 0}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
              notification.ok
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border-red-500/40 bg-red-500/15 text-red-300"
            }`}
          >
            {notification.ok ? "✓" : "✕"} {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === tab
                ? "bg-white/15 text-white border border-white/20"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab === "Semua" ? tab : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const style = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.COMMON;
          const isBuying = buying === item.id;
          const cantAfford = !item.canAfford;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative flex flex-col rounded-2xl border bg-black/30 p-4 transition-all duration-200 ${style.border} ${style.glow} hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                  {style.icon} {style.label}
                </span>
                {item.owned > 0 && (
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/50">
                    Dimiliki: {item.owned}
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-white mb-1">{item.name}</p>
              <p className="text-xs text-white/50 leading-relaxed mb-1">{item.description}</p>
              <p className="text-[11px] text-cyan-400/80 mb-3 flex-1">
                ⚡ {item.effect}
              </p>

              <button
                onClick={() => buyItem(item)}
                disabled={isBuying || cantAfford}
                className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
                  cantAfford
                    ? "bg-white/5 text-white/25 cursor-not-allowed border border-white/10"
                    : isBuying
                    ? "bg-white/10 text-white/50 cursor-wait"
                    : "bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 active:scale-[0.98]"
                }`}
              >
                {isBuying ? (
                  "Memproses..."
                ) : cantAfford ? (
                  `Butuh ${item.price.toLocaleString("id-ID")} 🪙`
                ) : (
                  `Beli — ${item.price.toLocaleString("id-ID")} 🪙`
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-white/30 text-sm">
          Tidak ada item di kategori ini
        </div>
      )}

      <p className="mt-6 text-center text-[11px] text-white/25">
        Coin didapat dari menyelesaikan task, daily chest, dan mengalahkan boss
      </p>
    </div>
  );
}
