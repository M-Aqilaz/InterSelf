"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { emitBossDamageEvent, emitTasksUpdatedEvent } from "@/lib/events";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEM_TASKS = [
  {
    key: "solar-rise",
    title: "Solar Rise Protocol",
    subtitle: "Aktivasi pagi",
    quickAction: "Bernapas dalam · Minum air · Tulis jurnal — selesai dalam 20 menit",
    detail: "Aktifkan tubuh dan pikiran dalam 20 menit pertama setelah bangun. Pernapasan mengaktifkan sistem saraf, hidrasi membersihkan kabut otak, jurnal menetapkan niat — ketiganya membangun jangkar pagi yang kuat.",
    actions: [
      "Lakukan 10 napas dalam segera setelah bangun dari tempat tidur",
      "Minum setidaknya 500ml air putih sebelum menyentuh HP",
      "Buka jurnal dan tulis 3 hal yang ingin kamu capai hari ini",
    ],
    matcher: ["solar rise protocol", "bangun pagi"],
    fallbackDescription: "Lakukan pernapasan, hidrasi, dan jurnal dalam 20 menit setelah bangun.",
  },
  {
    key: "deep-work",
    title: "Deep Work Sprint",
    subtitle: "Blok fokus 90 menit",
    quickAction: "Matikan HP · Buka 1 tugas · Kerja tanpa henti selama 90 menit",
    detail: "Masuk ke kondisi immersi total: telepon dimatikan, satu tab, satu tujuan. 90 menit output seperti ini menghasilkan leverage lebih besar dari 4 jam kerja multitasking yang terfragmentasi.",
    actions: [
      "Matikan semua notifikasi, HP dalam mode senyap atau dibalik",
      "Pilih SATU tugas yang paling penting dan buka hanya itu",
      "Kerjakan tanpa berhenti selama 90 menit penuh — tidak ada media sosial",
    ],
    matcher: ["deep work sprint", "belajar"],
    fallbackDescription: "Kerjakan 90 menit kerja terfokus dengan semua notifikasi dimatikan.",
  },
  {
    key: "micro-workout",
    title: "Micro-Compound Workout",
    subtitle: "Pemeliharaan kebugaran",
    quickAction: "Sirkuit 25 menit ATAU sebarkan 10 gerakan compound sepanjang hari",
    detail: "Sirkuit kekuatan 25 menit menargetkan semua kelompok otot utama. Alternatifnya, sebarkan 10 micro-set sepanjang hari — setiap gerakan menumpuk dan membentuk tubuh secara konsisten.",
    actions: [
      "Pilih mode: sirkuit 25 menit sekaligus ATAU 10 micro-set tersebar",
      "Fokus gerakan compound: squat, push-up, plank, lunges, atau pull-up",
      "Tandai selesai setelah semua set terpenuhi sebelum tidur malam",
    ],
    matcher: ["micro-compound workout", "workout"],
    fallbackDescription: "Lakukan sirkuit kekuatan 25 menit atau selesaikan 10 micro-set sepanjang hari.",
  },
  {
    key: "wealth-sync",
    title: "Wealth Sync Review",
    subtitle: "Kecerdasan finansial",
    quickAction: "Buka rekening · Audit pengeluaran kemarin · Tetapkan 1 langkah finansial",
    detail: "Buka rekening, audit setiap pengeluaran 24 jam terakhir, perbarui estimasi keuanganmu, dan identifikasi satu tindakan finansial berpengaruh untuk dieksekusi atau dijadwalkan. Kejelasan keuangan berbunga seperti investasi.",
    actions: [
      "Buka aplikasi bank dan cek saldo serta mutasi terbaru",
      "Catat semua pengeluaran kemarin — pisahkan kebutuhan dan keinginan",
      "Tentukan 1 tindakan: tabung, investasi, atau pangkas pengeluaran hari ini",
    ],
    matcher: ["wealth sync review", "menabung"],
    fallbackDescription: "Audit pengeluaran, perbarui runway, dan tetapkan langkah finansial berikutnya.",
  },
  {
    key: "nightly-check",
    title: "Nightly Systems Check",
    subtitle: "Ritual penutupan hari",
    quickAction: "Matikan semua layar · Catat hari ini · Rencanakan besok dalam 15 menit",
    detail: "Matikan semua input — tidak ada scrolling, tidak ada notifikasi. Dalam 15 menit: catat apa yang selesai, apa yang menghambat, dan persis apa langkah pertama esok hari. Persiapan malam hari menghilangkan kelelahan keputusan di pagi hari.",
    actions: [
      "Matikan semua layar dan notifikasi — ini bukan waktu scrolling",
      "Tulis apa yang berhasil hari ini dan apa yang menghambatmu",
      "Tentukan dengan spesifik: apa 1 langkah pertama yang akan kamu lakukan besok?",
    ],
    matcher: ["nightly systems check", "nightly"],
    fallbackDescription: "Matikan semua input, rencanakan hari esok, dan catat hari ini dalam 15 menit.",
  },
  {
    key: "neural-expansion",
    title: "Neural Expansion Block",
    subtitle: "Pemajemukan pengetahuan",
    quickAction: "Pilih 1 topik · Baca sumbernya · Catat 1 insight — 30 menit penuh",
    detail: "Dedikasikan 30 menit tanpa gangguan untuk satu topik penting — tidak ada membaca cepat, tidak ada ringkasan. Baca sumbernya, catat satu insight, hubungkan dengan hal yang sudah kamu ketahui. Satu konsep per hari mengubah cara berpikir dalam 90 hari.",
    actions: [
      "Pilih SATU topik atau buku yang relevan dengan tujuan jangka panjangmu",
      "Baca langsung dari sumber asli — bukan ringkasan atau thread media sosial",
      "Catat 1 insight utama dan hubungkan dengan sesuatu yang sudah kamu ketahui",
    ],
    matcher: ["neural expansion block", "neural expansion"],
    fallbackDescription: "Baca atau pelajari topik penting selama 30 menit terfokus — tanpa membaca cepat.",
  },
  {
    key: "reading",
    title: "Sesi Membaca Harian",
    subtitle: "Perluas wawasan",
    quickAction: "Pilih bacaan · Buka sumber · Aktifkan timer 15 menit · Baca dengan fokus",
    detail: "Pilih buku, jurnal, atau artikel berkualitas. Timer akan berjalan selama 15 menit — fokuslah pada pemahaman, bukan kecepatan. Klik salah satu sumber bacaan, lalu tekan Mulai.",
    actions: [
      "Pilih buku, jurnal, atau artikel yang ingin kamu baca hari ini",
      "Klik salah satu sumber bacaan di bawah untuk membukanya",
      "Tekan Mulai pada timer dan baca selama 15 menit penuh tanpa distraksi",
    ],
    matcher: ["sesi membaca harian", "membaca harian"],
    fallbackDescription: "Baca buku, jurnal, atau artikel berkualitas selama 15 menit tanpa gangguan.",
    timerMinutes: 15,
    readingUrls: [
      { label: "Medium", url: "https://medium.com" },
      { label: "Project Gutenberg", url: "https://www.gutenberg.org" },
      { label: "Google Scholar", url: "https://scholar.google.com" },
    ],
  },
];

type TaskStatReward = {
  id: number;
  stat: string;
  amount: number;
};

type TaskRecord = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  expReward: number;
  coinReward: number;
  streakImpact: number;
  isSystem: boolean;
  statRewards: TaskStatReward[];
  completedToday?: boolean;
};

type RewardBurst = {
  id: string;
  label: string;
  color: string;
  offset: number;
};

type RewardModalState = {
  taskName: string;
  exp: number;
  coins: number;
  stats: { label: string; value: number }[];
  bossDamage?: number;
};

type LevelModalState = {
  fromLevel: number;
  toLevel: number;
  newRank?: string | null;
  newTitle?: string | null;
};

type PlayerState = {
  level: number;
  rank: string | null;
  title: string | null;
};

const normalize = (value: string) => value.toLowerCase().trim();

const formatLabel = (label: string) =>
  label
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

export function DailyTasksPanel() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();
  const [floatingRewards, setFloatingRewards] = useState<RewardBurst[]>([]);
  const [rewardModal, setRewardModal] = useState<RewardModalState | null>(null);
  const [levelModal, setLevelModal] = useState<LevelModalState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Gagal memuat tugas");
      }
      const data = (await res.json()) as TaskRecord[];
      setTasks(data);
    } catch (err) {
      const message = (err as Error).message ?? "Gagal memuat tugas";
      setError(message);
      push({ title: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void (async () => {
      await fetchTasks();
    })();
  }, [fetchTasks]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { user: { profile?: { level: number; rank: string | null; title: string | null } | null } | null };
      if (data.user?.profile) {
        setPlayerState({
          level: data.user.profile.level,
          rank: data.user.profile.rank ?? null,
          title: data.user.profile.title ?? null,
        });
      }
    })();
  }, []);

  const systemMatches = useMemo(() => {
    return SYSTEM_TASKS.map((definition) => {
      const task = tasks.find((entry) => definition.matcher.some((match) => normalize(entry.title).includes(match)));
      return { definition, task };
    });
  }, [tasks]);

  const optionalTasks = useMemo(() => tasks.filter((task) => !task.isSystem), [tasks]);

  const refreshAll = useCallback(async () => {
    await fetchTasks();
    router.refresh();
  }, [fetchTasks, router]);

  const spawnFloaters = useCallback((rect: DOMRect, xp: number, coins: number, currentCombo: number) => {
    const cx = rect.left + rect.width * 0.65;
    const cy = rect.top + rect.height * 0.3;

    const makeFloat = (x: number, y: number, text: string, color: string, delay = 0) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = `
          position:fixed;left:${x}px;top:${y}px;
          color:${color};font-size:14px;font-weight:700;
          pointer-events:none;z-index:9999;
          animation:floatUp 1s ease-out forwards;
        `;
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1100);
      }, delay);
    };

    makeFloat(cx, cy, `+${xp} EXP`, '#00e5ff');
    makeFloat(cx + 20, cy - 15, `+${coins}`, '#f59e0b', 150);
    if (currentCombo >= 2) {
      makeFloat(cx - 10, cy - 30, `x${getComboMultiplier(currentCombo).toFixed(1)}`, '#a855f7', 250);
    }
  }, []);

  const completeTask = useCallback(
    (task: TaskRecord) => {
      startTransition(async () => {
        const res = await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          push({ title: payload.error ?? "Gagal menyelesaikan tugas", variant: "error" });
          return;
        }

        const rewardExp = payload?.completion?.expEarned ?? task.expReward;
        const rewardCoins = payload?.completion?.coinsEarned ?? task.coinReward;
        const statIncreases = Object.entries((payload?.completion?.statIncreases as Record<string, number>) ?? {});
        const bossDamage = payload?.bossBattle?.damageApplied ?? 0;

        // Combo logic
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
          setCombo(0);
        }, 5000);

        // Spawn floating numbers
        const cardEl = document.getElementById(`task-card-${task.id}`);
        if (cardEl) {
          const rect = cardEl.getBoundingClientRect();
          spawnFloaters(rect, rewardExp, rewardCoins, newCombo);
        }

        // Dynamic toast
        const isCritical = task.difficulty === 'HARD' || task.difficulty === 'LEGENDARY';
        if (isCritical) {
          push({
            title: `CRITICAL HIT! ${task.title}`,
            description: `+${rewardExp} EXP · -${bossDamage} DMG Boss`,
            variant: 'success',
          });
        } else if (newCombo >= 3) {
          push({
            title: `${newCombo}x COMBO! x${getComboMultiplier(newCombo).toFixed(1)} Multiplier`,
            description: `+${rewardExp} EXP · +${rewardCoins} koin`,
            variant: 'success',
          });
        } else {
          push({
            title: `${task.title} selesai!`,
            description: `+${rewardExp} EXP · +${rewardCoins} koin`,
            variant: 'success',
          });
        }
        const bursts: RewardBurst[] = [
          makeBurst(`+${rewardExp} EXP`, "text-[#50c890]"),
          makeBurst(`+${rewardCoins} Coins`, "text-[#f0c060]"),
        ];
        statIncreases.forEach(([stat, value]) => {
          if (!value) return;
          bursts.push(makeBurst(`+${value} ${formatLabel(stat)}`, "text-[#50c890]"));
        });

        if (bossDamage > 0) {
          bursts.push(makeBurst(`-${bossDamage} HP`, "text-rose-300"));
        }

        setFloatingRewards((prev) => [...prev, ...bursts]);
        setTimeout(() => {
          setFloatingRewards((prev) => prev.filter((burst) => !bursts.find((b) => b.id === burst.id)));
        }, 2000);

        setRewardModal({
          taskName: task.title,
          exp: rewardExp,
          coins: rewardCoins,
          stats: statIncreases.map(([label, value]) => ({ label: formatLabel(label), value })),
          bossDamage: bossDamage || undefined,
        });

        if (payload?.bossBattle) {
          emitBossDamageEvent({
            damage: payload.bossBattle.damageApplied,
            source: task.title,
            defeated: payload.bossBattle.defeated,
            rewards: payload.bossBattle.rewards
              ? {
                  exp: payload.bossBattle.rewards.exp,
                  coins: payload.bossBattle.rewards.coins,
                  itemName: payload.bossBattle.rewards.item?.name ?? null,
                }
              : null,
          });
        }

        if (payload?.levelProgress?.level) {
          const newLevel = payload.levelProgress.level;
          if (playerState && newLevel > playerState.level) {
            setLevelModal({
              fromLevel: playerState.level,
              toLevel: newLevel,
              newRank: payload.profile?.rank ?? null,
              newTitle: payload.profile?.title ?? null,
            });
          }
          setPlayerState({
            level: newLevel,
            rank: payload.profile?.rank ?? playerState?.rank ?? null,
            title: payload.profile?.title ?? playerState?.title ?? null,
          });
        }

        await refreshAll();
        emitTasksUpdatedEvent();
      });
    },
    [playerState, push, refreshAll, combo, spawnFloaters]
  );

  const addOptionalTask = useCallback(() => {
    if (!formTitle.trim() || !formDescription.trim()) {
      push({ title: "Isi judul dan deskripsi terlebih dahulu", variant: "error" });
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: "CUSTOM",
          difficulty: "MEDIUM",
          expReward: 80,
          coinReward: 25,
          streakImpact: 1,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({ title: payload.error ?? "Gagal membuat tugas", variant: "error" });
        return;
      }
      push({ title: "Tugas opsional ditambahkan", variant: "success" });
      setFormTitle("");
      setFormDescription("");
      await refreshAll();
      emitTasksUpdatedEvent();
    });
  }, [formDescription, formTitle, push, refreshAll]);

  return (
    <div className="relative overflow-hidden rounded-3xl border p-6" style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(160deg, #080b12, #0c1018)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl" style={{ background: "rgba(212,168,67,0.08)" }} />
        <div className="absolute -bottom-20 right-0 h-40 w-40 rounded-full blur-3xl" style={{ background: "rgba(58,170,122,0.08)" }} />
      </div>
      <AnimatePresence>
        {floatingRewards.map((burst) => (
          <motion.span
            key={burst.id}
            className={`pointer-events-none absolute text-sm font-semibold ${burst.color}`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -60 }}
            exit={{ opacity: 0, y: -90 }}
            style={{ right: `${burst.offset}%`, top: "20%" }}
          >
            {burst.label}
          </motion.span>
        ))}
      </AnimatePresence>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Tugas Harian</p>
          <h3 className="text-2xl font-black text-white">Antrian Misi</h3>
        </div>
        <Button variant="ghost" size="sm" disabled={loading} onClick={fetchTasks}>
          Segarkan
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-white/60">Memuat tugas...</p>
      ) : (
        <div className="relative mt-6 space-y-6">
          <section>
            <h4 className="text-[11px] uppercase tracking-[0.24em] text-white/50">Ritual Sistem</h4>
            <AnimatePresence>
              {combo >= 2 && <ComboHUD combo={combo} />}
            </AnimatePresence>
            <ul className="mt-3 space-y-4">
              {/* eslint-disable-next-line */}
              {systemMatches.map(({ definition, task }) => {
                const isExpanded = expandedKey === definition.key;
                const hasTimer = "timerMinutes" in definition && !!definition.timerMinutes;
                return (() => {
                  const isDone = task?.completedToday ?? false;
                  const isClickable = task && !isDone && !pending;

                  return (
                    <li
                      id={`task-card-${task?.id}`}
                      key={definition.key}
                      onClick={() => {
                        if (isClickable) completeTask(task);
                      }}
                      className={[
                        'relative flex overflow-hidden rounded-2xl transition-all duration-200',
                        isDone ? 'opacity-50 cursor-default' : '',
                        isClickable ? `cursor-pointer hover:bg-white/[0.06] hover:shadow-lg active:scale-[0.99]` : '',
                      ].join(' ')}
                      style={{
                        borderColor: isDone ? 'rgba(255,255,255,0.1)' : (
                          task?.difficulty === "HARD" || task?.difficulty === "LEGENDARY"
                            ? "rgba(224,90,106,0.3)"
                            : task?.difficulty === "EASY"
                            ? "rgba(58,170,122,0.25)"
                            : "rgba(212,168,67,0.25)"
                        ),
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      {/* Left accent bar */}
                      <div style={{
                        width: 3, flexShrink: 0,
                        background: isDone ? 'rgba(255,255,255,0.2)' : (
                          task?.difficulty === "HARD" || task?.difficulty === "LEGENDARY"
                            ? "#e05a6a"
                            : task?.difficulty === "EASY"
                            ? "#3aaa7a"
                            : "#d4a843"
                        ),
                      }} />

                      {/* Card body */}
                      <div className="flex-1 p-4">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Title + badge */}
                            <div className="flex flex-wrap items-center gap-2">
                              {isDone && (
                                <span className="text-xs" style={{ color: "#50c890" }}>✓</span>
                              )}
                              <p className={`text-sm font-bold ${isDone ? 'line-through text-white/40' : 'text-white'}`}>
                                {definition.title}
                              </p>
                              {task && (
                                <span
                                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                  style={{
                                    background: task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                      ? "rgba(224,90,106,0.15)"
                                      : task.difficulty === "EASY"
                                      ? "rgba(58,170,122,0.15)"
                                      : "rgba(212,168,67,0.15)",
                                    color: task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                      ? "#f07080"
                                      : task.difficulty === "EASY"
                                      ? "#50c890"
                                      : "#d4a843",
                                    border: `1px solid ${
                                      task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                        ? "rgba(224,90,106,0.3)"
                                        : task.difficulty === "EASY"
                                        ? "rgba(58,170,122,0.25)"
                                        : "rgba(212,168,67,0.25)"
                                    }`,
                                  }}
                                >
                                  {task.difficulty}
                                </span>
                              )}
                            </div>

                            {/* Subtitle kategori */}
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(212,168,67,0.6)" }}>
                              {definition.subtitle}
                            </p>

                            {/* Quick action desc */}
                            <p className="mt-2 text-xs text-white/60 leading-relaxed">
                              {definition.quickAction}
                            </p>
                          </div>

                          {/* Expand toggle — tetap ada */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedKey(isExpanded ? null : definition.key); }}
                            className="mt-0.5 shrink-0 rounded-lg border border-white/10 p-1.5 text-white/40 transition hover:text-white/70"
                            style={{ }}
                            aria-label={isExpanded ? 'Tutup detail' : 'Lihat detail'}
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        {/* Reward chips row */}
                        {task && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(58,170,122,0.1)", color: "#50c890" }}>
                              +{Math.round(task.expReward * getComboMultiplier(combo))} EXP
                            </span>
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(212,168,67,0.1)", color: "#d4a843" }}>
                              +{Math.round(task.coinReward * getComboMultiplier(combo))} coins
                            </span>
                            {task.statRewards?.map((sr) => (
                              <span key={sr.stat} className="rounded-md px-2 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                                +{sr.amount} {formatLabel(sr.stat)}
                              </span>
                            ))}
                            {combo >= 2 && !isDone && (
                              <span className="rounded-md bg-[rgba(212,168,67,0.15)] px-2 py-0.5 text-[11px] font-bold text-[var(--gold)] border border-[rgba(212,168,67,0.3)]">
                                x{getComboMultiplier(combo).toFixed(1)} COMBO
                              </span>
                            )}
                            {isDone ? (
                              <span className="ml-auto text-xs font-semibold" style={{ color: "#50c890" }}>Selesai hari ini ✓</span>
                            ) : (
                              <span className="ml-auto italic" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>klik untuk selesaikan</span>
                            )}
                          </div>
                        )}

                        {/* Expandable detail — tetap ada persis sama */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
                            <p className="text-xs leading-relaxed text-white/50">{definition.detail}</p>
                            {'actions' in definition && definition.actions && (
                              <ol className="space-y-2">
                                {(definition.actions as string[]).map((step, idx) => (
                                  <li key={idx} className="flex gap-3 text-xs text-white/65">
                                    <span className="shrink-0 font-mono text-[10px] mt-0.5" style={{ color: "rgba(212,168,67,0.5)" }}>
                                      {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            )}
                            {'readingUrls' in definition && definition.readingUrls && (
                              <div className="flex flex-wrap gap-2">
                                {(definition.readingUrls as { label: string; url: string }[]).map((src) => (
                                  <a
                                    key={src.url}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/20 hover:text-white/90"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {src.label}
                                  </a>
                                ))}
                              </div>
                            )}
                            {hasTimer && (
                              <ReadingTimer
                                minutes={definition.timerMinutes as number}
                                onComplete={() => {}}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })();
              })}
            </ul>
          </section>

          <section>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Tambah Tugas Opsional</p>
              <div className="mt-3 flex flex-col gap-3">
                <input
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="Judul tugas"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                />
                <textarea
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  rows={3}
                  placeholder="Deskripsikan ritual atau target"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                />
                <Button disabled={pending} onClick={addOptionalTask}>
                  Simpan tugas opsional
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Quest Tambahan</p>
              {optionalTasks.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">Belum ada tugas kustom.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {/* eslint-disable-next-line */}
                  {optionalTasks.map((task) => {
                    return (() => {
                      const isDone = task.completedToday ?? false;

                      return (
                        <li
                          id={`task-card-${task.id}`}
                          key={task.id}
                          onClick={() => { if (!isDone && !pending) completeTask(task); }}
                          className={[
                            'relative flex overflow-hidden rounded-2xl transition-all duration-200',
                            isDone ? 'opacity-50 cursor-default' : '',
                            !isDone && !pending ? `cursor-pointer hover:bg-white/[0.06] hover:shadow-lg active:scale-[0.99]` : '',
                          ].join(' ')}
                          style={{
                            borderColor: isDone ? 'rgba(255,255,255,0.1)' : (
                              task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                ? "rgba(224,90,106,0.3)"
                                : task.difficulty === "EASY"
                                ? "rgba(58,170,122,0.25)"
                                : "rgba(212,168,67,0.25)"
                            ),
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div style={{
                            width: 3, flexShrink: 0,
                            background: isDone ? 'rgba(255,255,255,0.2)' : (
                              task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                ? "#e05a6a"
                                : task.difficulty === "EASY"
                                ? "#3aaa7a"
                                : "#d4a843"
                            ),
                          }} />
                          <div className="flex-1 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className={`text-sm font-bold ${isDone ? 'line-through text-white/40' : 'text-white'}`}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-white/60">{task.description}</p>
                              </div>
                              <span
                                className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                  background: task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                    ? "rgba(224,90,106,0.15)"
                                    : task.difficulty === "EASY"
                                    ? "rgba(58,170,122,0.15)"
                                    : "rgba(212,168,67,0.15)",
                                  color: task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                    ? "#f07080"
                                    : task.difficulty === "EASY"
                                    ? "#50c890"
                                    : "#d4a843",
                                  border: `1px solid ${
                                    task.difficulty === "HARD" || task.difficulty === "LEGENDARY"
                                      ? "rgba(224,90,106,0.3)"
                                      : task.difficulty === "EASY"
                                      ? "rgba(58,170,122,0.25)"
                                      : "rgba(212,168,67,0.25)"
                                  }`,
                                }}
                              >
                                {task.difficulty}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(58,170,122,0.1)", color: "#50c890" }}>
                                +{Math.round(task.expReward * getComboMultiplier(combo))} EXP
                              </span>
                              <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(212,168,67,0.1)", color: "#d4a843" }}>
                                +{Math.round(task.coinReward * getComboMultiplier(combo))} coins
                              </span>
                              {isDone ? (
                                <span className="ml-auto text-xs font-semibold" style={{ color: "#50c890" }}>Selesai hari ini ✓</span>
                              ) : (
                                <span className="ml-auto italic" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>klik untuk selesaikan</span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })();
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
      <RewardModal state={rewardModal} onClose={() => setRewardModal(null)} />
      <LevelUpModal state={levelModal} onClose={() => setLevelModal(null)} />
    </div>
  );
}

function makeBurst(label: string, color: string): RewardBurst {
  return {
    id: `${label}-${Date.now()}-${Math.random()}`,
    label,
    color,
    offset: Math.random() * 30,
  };
}

function getComboMultiplier(combo: number): number {
  if (combo <= 1) return 1.0;
  if (combo === 2) return 1.3;
  if (combo === 3) return 1.6;
  if (combo === 4) return 2.0;
  return 2.5;
}

function getComboLabel(combo: number): string {
  const labels: Record<number, string> = {
    2: 'Double!', 3: 'Triple!', 4: 'Quad!', 5: 'Godmode!'
  };
  return labels[Math.min(combo, 5)] ?? 'Godmode!';
}

function ComboHUD({ combo }: { combo: number }) {
  if (combo < 2) return null;

  const mult = getComboMultiplier(combo);
  const label = getComboLabel(combo);

  const COMBO_RING_STYLES = {
    2: "border-[var(--jade)] shadow-[0_0_20px_rgba(58,170,122,0.3)]",
    3: "border-[var(--gold)] shadow-[0_0_24px_rgba(212,168,67,0.4)]",
    4: "border-[var(--rose)] shadow-[0_0_28px_rgba(224,90,106,0.5)]",
    5: "border-[var(--rose-light)] shadow-[0_0_32px_rgba(224,90,106,0.6)] animate-pulse",
  } as const;
  const ringColor = COMBO_RING_STYLES[Math.min(combo, 5) as 2 | 3 | 4 | 5];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-3"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 shadow-lg ${ringColor}`}>
        <span className="text-2xl font-black leading-none text-white">{combo}</span>
        <span className="text-[9px] uppercase tracking-widest text-white/60">combo</span>
      </div>
      <p className="mt-1.5 text-xs font-bold text-orange-300">{label}</p>
      <p className="text-xs text-white/55">x{mult.toFixed(1)} XP Multiplier aktif</p>
    </motion.div>
  );
}

function RewardModal({ state, onClose }: { state: RewardModalState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#07030f] p-6 text-white shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Hadiah</p>
            <h4 className="text-2xl font-black">{state.taskName}</h4>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>+{state.exp.toLocaleString()} EXP</p>
              <p>+{state.coins.toLocaleString()} koin</p>
              {state.stats.map((stat) => (
                <p key={stat.label}>+{stat.value} {stat.label}</p>
              ))}
              {state.bossDamage ? <p>Damage bos: {state.bossDamage}</p> : null}
            </div>
            <Button className="mt-6 w-full" onClick={onClose}>
              Lanjut
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReadingTimer({ minutes, onComplete }: { minutes: number; onComplete: () => void }) {
  const total = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && !finished) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, finished, onComplete]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progress = ((total - secondsLeft) / total) * 100;

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setSecondsLeft(total);
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-14 w-24 items-center justify-center rounded-xl border font-mono text-2xl font-black tabular-nums",
            finished
              ? "border-[rgba(58,170,122,0.4)] bg-[rgba(58,170,122,0.1)] text-[#50c890]"
              : running
              ? "border-[rgba(212,168,67,0.4)] bg-[rgba(212,168,67,0.1)] text-[#d4a843]"
              : "border-white/10 bg-black/30 text-white/70"
          )}
        >
          {mm}:{ss}
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                finished ? "bg-[#3aaa7a]" : "bg-[#d4a843]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/45">
            {finished
              ? "✓ Sesi selesai — klik Selesaikan untuk klaim hadiah."
              : running
              ? "Timer berjalan... tetap fokus."
              : "Tekan Mulai untuk memulai timer."}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {!finished && (
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className={cn(
              "rounded-xl px-4 py-1.5 text-xs font-semibold transition",
              running
                ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                : "bg-[#d4a843] text-[#080b12] hover:bg-[#f0c060]"
            )}
          >
            {running ? "Jeda" : "Mulai"}
          </button>
        )}
        {!running && (secondsLeft < total || finished) && (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-white/10 px-4 py-1.5 text-xs text-white/50 transition hover:text-white"
          >
            Ulang
          </button>
        )}
      </div>
    </div>
  );
}

function LevelUpModal({ state, onClose }: { state: LevelModalState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl border p-8 text-center text-white" style={{ borderColor: "rgba(212,168,67,0.3)", background: "linear-gradient(135deg, rgba(61,46,14,0.9), rgba(8,11,18,0.95))" }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Naik Level</p>
            <h3 className="mt-2 text-4xl font-black">Level {state.fromLevel} → {state.toLevel}</h3>
            {state.newTitle && <p className="mt-2 text-lg text-white/80">Gelar baru terbuka: {state.newTitle}</p>}
            {state.newRank && <p className="text-white/60">Peringkat naik ke {state.newRank}</p>}
            <Button className="mt-6" onClick={onClose}>
              Naik
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

