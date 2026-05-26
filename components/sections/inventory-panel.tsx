"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { useGameAudio } from "@/hooks/use-game-audio";

type InventoryEntry = {
  id: number;
  quantity: number;
  equipped: boolean;
  isConsumable: boolean;
  isEquippable: boolean;
  item: {
    id: number;
    name: string;
    rarity: string;
    description: string;
    effect: string;
  } | null;
};

type InventoryResponse = {
  inventory: InventoryEntry[];
  summary: { totalItems: number; legendaryEquipped: boolean };
};

const RARITY: Record<string, { border: string; bg: string; badge: string; badgeText: string; icon: string; label: string }> = {
  COMMON:    { border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)", badge: "rgba(255,255,255,0.08)", badgeText: "rgba(255,255,255,0.5)",  icon: "🪨", label: "Common"    },
  RARE:      { border: "rgba(34,211,238,0.3)",   bg: "rgba(34,211,238,0.04)", badge: "rgba(34,211,238,0.12)",  badgeText: "#22d3ee",                 icon: "💎", label: "Rare"      },
  EPIC:      { border: "rgba(139,92,246,0.4)",   bg: "rgba(139,92,246,0.05)", badge: "rgba(139,92,246,0.15)",  badgeText: "#c4b5fd",                 icon: "✨", label: "Epic"      },
  LEGENDARY: { border: "rgba(245,158,11,0.45)",  bg: "rgba(245,158,11,0.05)", badge: "rgba(245,158,11,0.15)",  badgeText: "#fcd34d",                 icon: "👑", label: "Legendary" },
  RELIC:     { border: "rgba(244,63,94,0.45)",   bg: "rgba(244,63,94,0.05)",  badge: "rgba(244,63,94,0.15)",   badgeText: "#fda4af",                 icon: "🌟", label: "Relic"     },
};

const SLOT_LABELS = ["Core Relic", "Augment", "Support"];

export function InventoryPanel() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, start] = useTransition();
  const { push } = useToast();
  const { play } = useGameAudio();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      push({ title: "Failed to load inventory", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { void load(); }, [load]);

  function equip(entryId: number) {
    start(async () => {
      const res = await fetch(`/api/inventory/${entryId}/equip`, { method: "POST" });
      if (res.ok) { void play("unlock", 100); void load(); }
      else push({ title: "Failed to equip", variant: "error" });
    });
  }

  function consume(entryId: number, name: string) {
    start(async () => {
      const res = await fetch(`/api/inventory/${entryId}/consume`, { method: "POST" });
      if (res.ok) { push({ title: `${name} used!`, variant: "success" }); void load(); }
      else push({ title: "Failed to use item", variant: "error" });
    });
  }

  const inventory = data?.inventory ?? [];
  const equipped = inventory.filter(e => e.equipped);
  const unequipped = inventory.filter(e => !e.equipped);
  const total = inventory.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a0f3a 0%, #0c1018 100%)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(139,92,246,0.7)", marginBottom: 4 }}>Loadout</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>Inventory</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Manage your relics and consumables</p>
        </div>
        <div style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#c4b5fd" }}>{total}</div>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(139,92,246,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Items</div>
        </div>
      </div>

      {/* Equipped slots */}
      <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>Equipped Relics</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: 16 }}>
          {SLOT_LABELS.map((slot, idx) => {
            const entry = equipped[idx];
            const r = entry?.item ? (RARITY[entry.item.rarity] ?? RARITY.COMMON) : null;
            return (
              <div key={slot} style={{
                background: r ? r.bg : "rgba(255,255,255,0.02)",
                border: `1px dashed ${r ? r.border : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, padding: 14, minHeight: 100,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>{slot}</div>
                {entry?.item ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{entry.item.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flex: 1 }}>{entry.item.description}</div>
                    <span style={{ alignSelf: "flex-start", background: r?.badge, color: r?.badgeText, borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>
                      {r?.icon} {r?.label}
                    </span>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.18)", fontSize: 11 }}>
                    Empty slot
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory items */}
      <div style={{ background: "#0c1018", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>Items</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{total} item{total !== 1 ? "s" : ""}</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading...</div>
        ) : inventory.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎒</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>Inventory empty</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Buy items from the Shop to get started</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16 }}>
            {inventory.map(entry => {
              if (!entry.item) return null;
              const r = RARITY[entry.item.rarity] ?? RARITY.COMMON;
              return (
                <div key={entry.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: r.bg, border: `1px solid ${r.border}`,
                  borderRadius: 12, padding: "12px 14px",
                }}>
                  {/* Rarity icon */}
                  <div style={{ width: 44, height: 44, flexShrink: 0, background: r.badge, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {r.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{entry.item.name}</span>
                      <span style={{ background: r.badge, color: r.badgeText, borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>{r.label}</span>
                      {entry.quantity > 1 && <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", borderRadius: 4, padding: "1px 6px", fontSize: 9 }}>x{entry.quantity}</span>}
                      {entry.equipped && <span style={{ background: "rgba(58,170,122,0.15)", color: "#3aaa7a", borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>Equipped</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{entry.item.description}</div>
                    <div style={{ fontSize: 11, color: "#22d3ee", marginTop: 2 }}>⚡ {entry.item.effect}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {entry.isConsumable && entry.quantity > 0 && (
                      <button type="button" disabled={pending}
                        onClick={() => consume(entry.id, entry.item!.name)}
                        style={{ background: pending ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #7c3aed, #8b5cf6)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 700, color: "#fff", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.6 : 1 }}>
                        {pending ? "Using..." : "Use"}
                      </button>
                    )}
                    {entry.isEquippable && !entry.equipped && (
                      <button type="button" disabled={pending}
                        onClick={() => equip(entry.id)}
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                        Equip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


