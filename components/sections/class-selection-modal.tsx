"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CLASS_DEFINITIONS } from "@/lib/classes";
import { ClassSelectionArena } from "@/components/sections/class-selection-arena";

type Props = {
  onClassChosen: (characterClass: string) => void;
};

export function ClassSelectionModal({ onClassChosen }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDef = CLASS_DEFINITIONS.find((classDef) => classDef.id === selected);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

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
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Gagal memilih class");
    setConfirming(false);
  }, [selected, confirming, onClassChosen]);

  return (
    <div className="fixed inset-0 z-50 flex h-dvh items-center justify-center overflow-hidden bg-black/85 p-3 backdrop-blur-sm sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-6xl overflow-hidden rounded-[30px] border border-blue-500/35 bg-gradient-to-br from-[#020617] via-[#07112a] to-[#03040c] p-4 text-white shadow-[0_0_70px_rgba(37,99,235,0.25)] sm:max-h-[calc(100dvh-2rem)] sm:p-5"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.22),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,0.15),transparent_38%)]" />

        <div className="relative mb-4 text-center">
          <p className="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.44em] text-[#c4b5fd]">
            Satu kali. Pilih dengan bijak.
          </p>
          <h2 className="font-serif text-4xl font-black leading-none text-white drop-shadow-[0_0_18px_rgba(147,197,253,0.55)] sm:text-6xl">
            Pilih Kelasmu
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
            Class menentukan stat awal dan bonus pasif yang kamu bawa seumur hidup karakter ini.
          </p>
        </div>

        <div className="relative mb-4">
          <ClassSelectionArena selected={selected} onSelect={setSelected} compact />
        </div>

        <AnimatePresence mode="wait">
          {selectedDef && (
            <motion.div
              key={selectedDef.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`relative mb-4 rounded-2xl border ${selectedDef.borderColor} bg-white/4 p-3`}
            >
              <p className="text-xs leading-relaxed text-white/70">{selectedDef.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="relative mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected || confirming}
          className={[
            "relative w-full rounded-2xl py-3 text-sm font-black uppercase tracking-[0.28em] transition-all",
            selected && !confirming
              ? `bg-gradient-to-r ${
                  selectedDef?.id === "IRONCLAD"
                    ? "from-red-600 to-red-500"
                    : selectedDef?.id === "SAGE"
                      ? "from-cyan-600 to-cyan-500"
                      : selectedDef?.id === "PHANTOM"
                        ? "from-purple-600 to-purple-500"
                        : "from-amber-600 to-amber-500"
                } text-white shadow-[0_0_28px_rgba(56,189,248,0.25)] hover:opacity-90 active:scale-[0.99]`
              : "cursor-not-allowed bg-white/8 text-white/30",
          ].join(" ")}
        >
          {confirming ? "Mengaktifkan class..." : selected ? `Pilih ${selectedDef?.name}` : "Pilih class dulu"}
        </button>

        <p className="relative mt-2 text-center text-[12px] text-white/35">
          Class hanya bisa diubah dengan item langka &ldquo;Class Crystal&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
