"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CLASS_DEFINITIONS } from "@/lib/classes";

type Props = {
  onClassChosen: (characterClass: string) => void;
};

export function ClassSelectionModal({ onClassChosen }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    if (!selected || confirming) return;
    setConfirming(true);
    setError(null);

    const res = await fetch("/api/profile/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterClass: selected }),
    });

    if (res.ok) {
      onClassChosen(selected);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal memilih class");
      setConfirming(false);
    }
  }, [selected, confirming, onClassChosen]);

  const selectedDef = CLASS_DEFINITIONS.find((c) => c.id === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="my-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#06091a] via-[#0a0f24] to-[#080618] p-5 text-white shadow-2xl sm:p-6"
      >
        <div className="mb-6 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Satu kali. Pilih dengan bijak.
          </p>
          <h2 className="text-2xl font-black sm:text-3xl">Pilih Kelasmu</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/50">
            Class menentukan stat awal dan bonus pasif yang kamu bawa seumur hidup karakter ini.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CLASS_DEFINITIONS.map((cls) => (
            <motion.button
              key={cls.id}
              onClick={() => setSelected(cls.id)}
              whileTap={{ scale: 0.98 }}
              className={[
                "relative min-h-44 rounded-2xl border p-4 text-left transition-all duration-200",
                selected === cls.id
                  ? `${cls.borderColor} bg-white/8 ${cls.glowColor} shadow-lg`
                  : "border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20",
              ].join(" ")}
            >
              {selected === cls.id && (
                <motion.div
                  layoutId="class-selected"
                  className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${cls.badgeStyle}`}
                  initial={false}
                >
                  ✓
                </motion.div>
              )}

              <div className="mb-2 text-2xl">{cls.icon}</div>
              <p className={`mb-0.5 text-sm font-black ${cls.color}`}>{cls.name}</p>
              <p className="mb-3 text-[11px] italic text-white/50">{cls.tagline}</p>

              <div className="mb-2 flex flex-wrap gap-1">
                {Object.entries(cls.initialStats).map(([stat, val]) => (
                  <span
                    key={stat}
                    className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/60"
                  >
                    +{val} {stat.charAt(0) + stat.slice(1).toLowerCase()}
                  </span>
                ))}
              </div>

              <p className={`text-[11px] font-semibold leading-relaxed ${cls.color}`}>
                Bonus: {cls.passiveBonus}
              </p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedDef && (
            <motion.div
              key={selectedDef.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`mb-5 rounded-2xl border ${selectedDef.borderColor} bg-white/4 p-4`}
            >
              <p className="text-xs leading-relaxed text-white/70">{selectedDef.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected || confirming}
          className={[
            "w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-wider transition-all",
            selected && !confirming
              ? `bg-gradient-to-r ${
                  selectedDef?.id === "IRONCLAD"
                    ? "from-red-600 to-red-500"
                    : selectedDef?.id === "SAGE"
                      ? "from-cyan-600 to-cyan-500"
                      : selectedDef?.id === "PHANTOM"
                        ? "from-purple-600 to-purple-500"
                        : "from-amber-600 to-amber-500"
                } text-white hover:opacity-90 active:scale-[0.99]`
              : "bg-white/8 text-white/30 cursor-not-allowed",
          ].join(" ")}
        >
          {confirming
            ? "Mengaktifkan class..."
            : selected
              ? `Pilih ${selectedDef?.name} - Tidak bisa diubah`
              : "Pilih class dulu"}
        </button>

        <p className="mt-3 text-center text-[10px] text-white/25">
          Class hanya bisa diubah dengan item langka &ldquo;Class Crystal&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
