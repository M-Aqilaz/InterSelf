"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";

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
  summary: {
    totalItems: number;
    legendaryEquipped: boolean;
  };
};

export function InventoryPanel() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load inventory");
      const json = (await res.json()) as InventoryResponse;
      setData(json);
    } catch {
      push({ title: "Failed to load inventory", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void (async () => {
      await loadInventory();
    })();
  }, [loadInventory]);

  function rarityBadge(rarity: string) {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-yellow-500/20 text-yellow-200";
      case "EPIC":
        return "bg-purple-500/20 text-purple-200";
      case "RARE":
        return "bg-cyan-500/20 text-cyan-200";
      default:
        return "bg-white/10 text-white/70";
    }
  }

  function equip(item: InventoryEntry, equipped: boolean) {
    startTransition(async () => {
      const res = await fetch(`/api/inventory/${item.id}/equip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipped }),
      });
      const json = await res.json();
      if (!res.ok) {
        push({ title: json.error ?? "Unable to update item", variant: "error" });
        return;
      }
      push({
        title: equipped ? "Item equipped" : "Item unequipped",
        description: item.item?.name,
        variant: "success",
      });
      loadInventory();
    });
  }

  function consume(item: InventoryEntry) {
    startTransition(async () => {
      const res = await fetch(`/api/inventory/${item.id}/consume`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        push({ title: json.error ?? "Unable to consume", variant: "error" });
        return;
      }
      push({
        title: "Item consumed",
        description: item.item?.name,
        variant: "success",
      });
      loadInventory();
    });
  }

  const equippedItems = useMemo(() => data?.inventory.filter((item) => item.equipped) ?? [], [data]);
  const totalSlots = 3;
  const slots = new Array(totalSlots).fill(null).map((_, index) => equippedItems[index] ?? null);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#04020b] to-[#12021f] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Inventory</p>
          <h3 className="text-2xl font-black text-white">Loadout</h3>
        </div>
        <div className="text-right text-xs text-white/60">
          <p>Total items: {data?.summary.totalItems ?? 0}</p>
          {data?.summary.legendaryEquipped && <p className="text-yellow-200">Legendary equipped</p>}
        </div>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading inventory...</p>
      ) : data && data.inventory.length > 0 ? (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Equipped</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {slots.map((entry, index) => (
                <motion.div
                  key={entry?.id ?? index}
                  className={`rounded-2xl border px-4 py-4 ${entry ? rarityBadge(entry.item?.rarity ?? "") : "border-dashed border-white/20 text-white/40"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {entry ? (
                    <>
                      <p className="text-sm font-semibold text-white">{entry.item?.name}</p>
                      <p className="text-xs text-white/60">{entry.item?.description}</p>
                      <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase text-white/60">
                        Equipped
                      </span>
                    </>
                  ) : (
                    <p>Empty slot</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Inventory</p>
            <ul className="mt-3 space-y-4">
              {data.inventory.map((entry) => (
                <motion.li
                  key={entry.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.item?.name ?? "Unknown"}</p>
                      <p className="text-xs text-white/60">{entry.item?.description}</p>
                    </div>
                    <div className="text-right text-xs">
                      <span className={`rounded-full px-3 py-1 text-[10px] uppercase ${rarityBadge(entry.item?.rarity ?? "COMMON")}`}>
                        {entry.item?.rarity ?? "COMMON"}
                      </span>
                      <p className="text-white/60">Qty: {entry.quantity}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {entry.isEquippable && (
                      <Button
                        size="sm"
                        variant={entry.equipped ? "secondary" : "primary"}
                        disabled={pending}
                        onClick={() => equip(entry, !entry.equipped)}
                      >
                        {entry.equipped ? "Unequip" : "Equip"}
                      </Button>
                    )}
                    {entry.isConsumable && (
                      <Button size="sm" disabled={pending} onClick={() => consume(entry)}>
                        Consume
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-white/60">Effect: {entry.item?.effect}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-white/60">No items yet. Defeat bosses to earn gear.</p>
      )}
    </div>
  );
}
