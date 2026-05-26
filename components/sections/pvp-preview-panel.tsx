"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type PvpMode = "TASK_COUNT" | "EXP_RACE" | "STREAK_HOLD";
type PvpStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "DECLINED" | "CANCELLED";

type Challenge = {
  id: number;
  mode: PvpMode;
  status: PvpStatus;
  startsAt: string | null;
  endsAt: string | null;
  rewardCoins: number;
  rewardExp: number;
  winnerId: string | null;
  message: string | null;
  createdAt: string;
  isChallenger: boolean;
  myScore: number;
  opponentScore: number;
  iWon: boolean;
  isDraw: boolean;
  opponent: { userId: string; username: string; level: number };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_LABELS: Record<PvpMode, { label: string; icon: string; desc: string }> = {
  TASK_COUNT: { label: "Task Race",   icon: "⚔️", desc: "Siapa lebih banyak task selesai" },
  EXP_RACE:   { label: "EXP Race",   icon: "⚡", desc: "Siapa lebih banyak EXP terkumpul" },
  STREAK_HOLD:{ label: "Streak Hold",icon: "🔥", desc: "Siapa streak-nya lebih panjang" },
};

const STATUS_STYLES: Record<PvpStatus, { badge: string; label: string }> = {
  PENDING:   { badge: "bg-[rgba(212,168,67,0.15)] text-[var(--gold)] border border-[rgba(212,168,67,0.3)]",   label: "Menunggu" },
  ACTIVE:    { badge: "bg-[rgba(224,90,106,0.15)] text-[var(--rose-light)] border border-[rgba(224,90,106,0.3)]",       label: "Berlangsung" },
  COMPLETED: { badge: "bg-purple-500/15 text-purple-300 border border-purple-500/30", label: "Selesai" },
  DECLINED:  { badge: "bg-red-500/15 text-red-400 border border-red-500/30",          label: "Ditolak" },
  CANCELLED: { badge: "bg-white/10 text-white/40",                                    label: "Dibatalkan" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ myScore, opponentScore, mode }: { myScore: number; opponentScore: number; mode: PvpMode }) {
  const total = myScore + opponentScore;
  const myPct = total === 0 ? 50 : Math.round((myScore / total) * 100);
  const unit = mode === "EXP_RACE" ? " EXP" : mode === "TASK_COUNT" ? " task" : " hari";

  return (
    <div className="my-3">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-[var(--jade-light)]">Kamu: {myScore}{unit}</span>
          <span className="text-[var(--rose-light)]">Lawan: {opponentScore}{unit}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--jade)] to-[var(--jade-light)] rounded-l-full"
          animate={{ width: `${myPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.div
          className="h-full bg-gradient-to-l from-rose-500 to-rose-400 rounded-r-full flex-1"
        />
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  onRespond,
  onCancel,
}: {
  challenge: Challenge;
  onRespond: (id: number, action: "accept" | "decline") => void;
  onCancel: (id: number) => void;
}) {
  const modeInfo = MODE_LABELS[challenge.mode];
  const statusInfo = STATUS_STYLES[challenge.status];
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (!challenge.endsAt) return null;
    return Math.max(0, Math.ceil((new Date(challenge.endsAt).getTime() - Date.now()) / 86400000));
  });

  useEffect(() => {
    if (!challenge.endsAt) return;
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((new Date(challenge.endsAt!).getTime() - Date.now()) / 86400000)));
    }, 60000);
    return () => clearInterval(interval);
  }, [challenge.endsAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl border border-white/10 bg-white/4 p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{modeInfo.icon}</span>
          <div>
            <p className="text-sm font-bold text-white">{modeInfo.label}</p>
            <p className="text-[11px] text-white/50">{modeInfo.desc}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusInfo.badge}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Opponent */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black">
          {challenge.opponent.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{challenge.opponent.username}</p>
          <p className="text-[10px] text-white/40">Level {challenge.opponent.level}</p>
        </div>
        {challenge.isChallenger
          ? <span className="ml-auto text-[10px] text-white/30">Kamu menantang</span>
          : <span className="ml-auto text-[10px] text-amber-400/70">Menantangmu</span>
        }
      </div>

      {/* Message */}
      {challenge.message && (
        <p className="text-xs text-white/50 italic border-l-2 border-white/10 pl-2 mb-2">
          &ldquo;{challenge.message}&rdquo;
        </p>
      )}

      {/* Score bar (hanya kalau ACTIVE) */}
      {challenge.status === "ACTIVE" && (
        <>
          <ScoreBar myScore={challenge.myScore} opponentScore={challenge.opponentScore} mode={challenge.mode} />
          {timeLeft !== null && (
            <p className="text-[10px] text-white/40 text-center">
              {timeLeft === 0 ? "Berakhir hari ini" : `${timeLeft} hari tersisa`}
            </p>
          )}
        </>
      )}

      {/* Result (COMPLETED) */}
      {challenge.status === "COMPLETED" && (
        <div className={`rounded-xl p-3 text-center mt-2 ${
          challenge.iWon
            ? "bg-amber-500/10 border border-amber-500/20"
            : challenge.isDraw
            ? "bg-white/5 border border-white/10"
            : "bg-red-500/10 border border-red-500/20"
        }`}>
          <p className="text-sm font-black">
            {challenge.iWon ? "🏆 Kamu Menang!" : challenge.isDraw ? "🤝 Seri" : "💀 Kalah"}
          </p>
          <p className="text-[11px] text-white/50 mt-0.5">
            {challenge.myScore} vs {challenge.opponentScore}
            {challenge.iWon && ` · +${challenge.rewardCoins} coins +${challenge.rewardExp} EXP`}
          </p>
        </div>
      )}

      {/* Actions */}
      {challenge.status === "PENDING" && !challenge.isChallenger && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onRespond(challenge.id, "accept")}
            className="flex-1 rounded-xl bg-[rgba(224,90,106,0.12)] border border-[rgba(224,90,106,0.3)] py-2 text-xs font-bold text-[var(--rose-light)] hover:bg-[rgba(224,90,106,0.2)] transition-colors"
          >
            ✓ Terima
          </button>
          <button
            onClick={() => onRespond(challenge.id, "decline")}
            className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            ✕ Tolak
          </button>
        </div>
      )}

      {challenge.status === "PENDING" && challenge.isChallenger && (
        <button
          onClick={() => onCancel(challenge.id)}
          className="w-full mt-3 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-semibold text-white/40 hover:text-white/60 transition-colors"
        >
          Batalkan challenge
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function PvpPreviewPanel() {
  const { push } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "pending" | "history">("active");
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ username: "", mode: "TASK_COUNT" as PvpMode, message: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadChallenges = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch("/api/pvp", { 
        cache: "no-store",
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges ?? []);
      }
    } catch (error) {
      console.error("Failed to load PvP challenges:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await loadChallenges();
    };
    void load();
    return () => { mounted = false; };
  }, [loadChallenges]);

  const handleRespond = useCallback(async (id: number, action: "accept" | "decline") => {
    const res = await fetch(`/api/pvp/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      push({ title: action === "accept" ? "Challenge diterima! Dimulai sekarang." : "Challenge ditolak.", variant: "success" });
      void loadChallenges();
    } else {
      const d = await res.json().catch(() => ({}));
      push({ title: d.error ?? "Gagal", variant: "error" });
    }
  }, [loadChallenges, push]);

  const handleCancel = useCallback(async (id: number) => {
    const res = await fetch(`/api/pvp/${id}`, { method: "DELETE" });
    if (res.ok) {
      push({ title: "Challenge dibatalkan.", variant: "success" });
      void loadChallenges();
    }
  }, [loadChallenges, push]);

  const handleSendChallenge = useCallback(async () => {
    if (!form.username.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/pvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username.trim(), mode: form.mode, message: form.message || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      push({ title: `Challenge dikirim ke ${form.username}!`, variant: "success" });
      setForm({ username: "", mode: "TASK_COUNT", message: "" });
      setShowNewForm(false);
      void loadChallenges();
    } else {
      push({ title: data.error ?? "Gagal mengirim challenge", variant: "error" });
    }
    setSubmitting(false);
  }, [form, submitting, loadChallenges, push]);

  const filtered = challenges.filter((c) => {
    if (tab === "active") return c.status === "ACTIVE";
    if (tab === "pending") return c.status === "PENDING";
    return ["COMPLETED", "DECLINED", "CANCELLED"].includes(c.status);
  });

  const pendingCount = challenges.filter((c) => c.status === "PENDING" && !c.isChallenger).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#020612] via-[#0c0820] to-[#1d0d32] p-6 text-white">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-48 w-48 rounded-full bg-[rgba(224,90,106,0.15)] blur-3xl" />
        <div className="absolute -bottom-16 right-6 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Arena</p>
            <h3 className="text-2xl font-black text-[var(--rose)]">Productivity Duel</h3>
            <p className="text-xs text-white/50 mt-0.5">Challenge teman — siapa lebih produktif minggu ini?</p>
          </div>
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="shrink-0 rounded-xl border border-[rgba(224,90,106,0.35)] bg-[rgba(224,90,106,0.12)] px-4 py-2 text-xs font-bold text-[var(--rose-light)] hover:bg-[rgba(224,90,106,0.2)] transition-colors"
          >
            {showNewForm ? "Tutup" : "+ Challenge"}
          </button>
        </div>

        {/* New Challenge Form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5 space-y-3">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Kirim Challenge Baru</p>

                <input
                  type="text"
                  placeholder="Username teman (harus sudah berteman)"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[rgba(224,90,106,0.35)]"
                />

                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(MODE_LABELS) as [PvpMode, typeof MODE_LABELS[PvpMode]][]).map(([mode, info]) => (
                    <button
                      key={mode}
                      onClick={() => setForm((f) => ({ ...f, mode }))}
                      className={`rounded-xl border p-2 text-center transition-all ${
                        form.mode === mode
                          ? "border-[rgba(224,90,106,0.35)] bg-[rgba(224,90,106,0.12)] text-[var(--rose-light)]"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg mb-0.5">{info.icon}</div>
                      <p className="text-[10px] font-bold">{info.label}</p>
                      <p className="text-[9px] text-white/40">{info.desc}</p>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Pesan (opsional, maks 100 karakter)"
                  maxLength={100}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[rgba(224,90,106,0.35)]"
                />

                <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
                  <span>Durasi: 7 hari · Reward pemenang: 150 coins + 200 EXP</span>
                </div>

                <button
                  onClick={handleSendChallenge}
                  disabled={!form.username.trim() || submitting}
                  className="w-full rounded-xl bg-[var(--rose)] py-2.5 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  {submitting ? "Mengirim..." : "Kirim Challenge ⚔️"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["active", "pending", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                tab === t ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {t === "active" ? "Berlangsung" : t === "pending" ? "Pending" : "Riwayat"}
              {t === "pending" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Challenge list */}
        {loading ? (
          <div className="py-8 text-center text-white/30 text-sm">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-white/30 text-sm">
              {tab === "active" ? "Tidak ada duel yang sedang berlangsung." :
               tab === "pending" ? "Tidak ada challenge yang menunggu." :
               "Belum ada riwayat duel."}
            </p>
            {tab === "active" && (
              <button
                onClick={() => setShowNewForm(true)}
                className="mt-3 text-xs text-[var(--jade-light)] hover:text-[var(--rose-light)]"
              >
                Tantang teman sekarang →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onRespond={handleRespond}
                  onCancel={handleCancel}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

