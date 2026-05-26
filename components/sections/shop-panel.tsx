"use client";

import { useCallback, useEffect, useState } from "react";

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

type ShopData = { items: ShopItem[]; userCoins: number };

const RARITY: Record<string, { border: string; badgeBg: string; badgeColor: string; label: string; icon: string; glow: string }> = {
  COMMON:    { border: "rgba(255,255,255,0.12)", badgeBg: "rgba(255,255,255,0.08)",  badgeColor: "rgba(255,255,255,0.5)",  label: "Common",    icon: "🪨", glow: "transparent" },
  RARE:      { border: "rgba(34,211,238,0.35)",  badgeBg: "rgba(34,211,238,0.12)",   badgeColor: "#22d3ee",               label: "Rare",      icon: "💎", glow: "rgba(34,211,238,0.06)" },
  EPIC:      { border: "rgba(139,92,246,0.45)",  badgeBg: "rgba(139,92,246,0.15)",   badgeColor: "#c4b5fd",               label: "Epic",      icon: "✨", glow: "rgba(139,92,246,0.08)" },
  LEGENDARY: { border: "rgba(245,158,11,0.5)",   badgeBg: "rgba(245,158,11,0.15)",   badgeColor: "#fcd34d",               label: "Legendary", icon: "👑", glow: "rgba(245,158,11,0.08)" },
  RELIC:     { border: "rgba(244,63,94,0.5)",    badgeBg: "rgba(244,63,94,0.15)",    badgeColor: "#fda4af",               label: "Relic",     icon: "🌟", glow: "rgba(244,63,94,0.08)" },
};

const FILTERS = ["All", "COMMON", "RARE", "EPIC", "LEGENDARY"] as const;

export function ShopPanel() {
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const buy = useCallback(async (item: ShopItem) => {
    if (buying !== null) return;
    setBuying(item.id);
    const res = await fetch("/api/shop/buy", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, quantity: 1 }),
    });
    const result = await res.json();
    if (res.ok) {
      setToast({ msg: `${item.name} purchased!`, ok: true });
      setData(prev => prev ? {
        userCoins: result.remainingCoins,
        items: prev.items.map(i => i.id === item.id
          ? { ...i, owned: i.owned + 1, canAfford: result.remainingCoins >= i.price }
          : { ...i, canAfford: result.remainingCoins >= i.price }),
      } : null);
    } else {
      setToast({ msg: result.error ?? "Purchase failed", ok: false });
    }
    setTimeout(() => setToast(null), 3000);
    setBuying(null);
  }, [buying]);

  const items = data?.items ?? [];
  const filtered = filter === "All" ? items : items.filter(i => i.rarity === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Shop header card */}
      <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {/* Top banner */}
        <div style={{ background: "linear-gradient(135deg, #1a0f3a 0%, #0c1018 100%)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(245,158,11,0.7)", marginBottom: 4 }}>Emporium</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>Item Shop</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Spend your coins on powerful boosts and relics</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "10px 16px" }}>
            <span style={{ fontSize: 20 }}>🪙</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fcd34d" }}>{(data?.userCoins ?? 0).toLocaleString()}</div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(245,158,11,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Coins</div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {FILTERS.map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                border: "1px solid",
                borderColor: filter === f ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)",
                background: filter === f ? "rgba(139,92,246,0.18)" : "transparent",
                color: filter === f ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}>
              {f === "All" ? "All Items" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ margin: "12px 16px 0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: toast.ok ? "rgba(58,170,122,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.ok ? "rgba(58,170,122,0.35)" : "rgba(239,68,68,0.35)"}`, color: toast.ok ? "#3aaa7a" : "#f87171" }}>
            {toast.ok ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        {/* Items grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading shop...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 16 }}>
            {filtered.map(item => {
              const r = RARITY[item.rarity] ?? RARITY.COMMON;
              const isBuying = buying === item.id;
              const cantAfford = !item.canAfford;
              return (
                <div key={item.id} style={{
                  display: "flex", flexDirection: "column",
                  background: `linear-gradient(145deg, ${r.glow} 0%, #0c1018 100%)`,
                  border: `1px solid ${r.border}`,
                  borderRadius: 14, padding: 16,
                  transition: "transform 0.15s",
                }}>
                  {/* Rarity badge + owned */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: r.badgeBg, color: r.badgeColor, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {r.icon} {r.label}
                    </span>
                    {item.owned > 0 && (
                      <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600 }}>
                        Owned: {item.owned}
                      </span>
                    )}
                  </div>

                  {/* Item name */}
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{item.name}</div>

                  {/* Description */}
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 6, flex: 1 }}>{item.description}</div>

                  {/* Effect */}
                  <div style={{ fontSize: 11, color: "#22d3ee", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <span>⚡</span>
                    <span>{item.effect}</span>
                  </div>

                  {/* Buy button */}
                  <button type="button" onClick={() => buy(item)} disabled={isBuying || cantAfford}
                    style={{
                      width: "100%", borderRadius: 10, padding: "10px",
                      fontSize: 12, fontWeight: 800, border: "none", cursor: cantAfford ? "not-allowed" : "pointer",
                      background: cantAfford
                        ? "rgba(255,255,255,0.05)"
                        : isBuying
                        ? "rgba(255,255,255,0.1)"
                        : "linear-gradient(135deg, #d97706, #f59e0b)",
                      color: cantAfford ? "rgba(255,255,255,0.2)" : isBuying ? "rgba(255,255,255,0.5)" : "#000",
                    }}>
                    {isBuying ? "Processing..." : cantAfford ? `Need ${item.price.toLocaleString()} 🪙` : `Buy — ${item.price.toLocaleString()} 🪙`}
                  </button>
                </div>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                No items in this category
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "8px 16px 16px", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Coins earned by completing tasks, daily chest, and defeating bosses
        </div>
      </div>
    </div>
  );
}
