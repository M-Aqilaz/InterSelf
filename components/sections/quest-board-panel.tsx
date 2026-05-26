"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Check, Edit3, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { emitBossDamageEvent, emitTasksUpdatedEvent } from "@/lib/events";

type TaskRecord = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  expReward: number;
  coinReward: number;
  streakImpact: number;
  durationMinutes?: number | null;
  isSystem: boolean;
  completedToday?: boolean;
};

type QuestForm = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  expReward: number;
  coinReward: number;
  streakImpact: number;
  durationMinutes: number;
};

const EMPTY_FORM: QuestForm = {
  title: "",
  description: "",
  category: "CUSTOM",
  difficulty: "EASY",
  expReward: 25,
  coinReward: 10,
  streakImpact: 1,
  durationMinutes: 0,
};

const CATEGORIES = [
  { value: "CUSTOM", label: "Custom" },
  { value: "FOCUS", label: "Focus" },
  { value: "STUDY", label: "Study" },
  { value: "WORKOUT", label: "Workout" },
  { value: "SAVE_MONEY", label: "Finance" },
  { value: "WAKE_UP", label: "Morning" },
];

const DIFFICULTIES = [
  { value: "EASY", label: "Easy", color: "#50c890" },
  { value: "MEDIUM", label: "Medium", color: "#d4a843" },
  { value: "HARD", label: "Hard", color: "#f07080" },
  { value: "LEGENDARY", label: "Legendary", color: "#c084fc" },
];

export function QuestBoardPanel() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [form, setForm] = useState<QuestForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const customTasks = useMemo(() => tasks.filter((task) => !task.isSystem), [tasks]);
  const systemTasks = useMemo(() => tasks.filter((task) => task.isSystem), [tasks]);
  const doneCount = tasks.filter((task) => task.completedToday).length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal memuat quest");
      setTasks((await response.json()) as TaskRecord[]);
    } catch (error) {
      push({ title: (error as Error).message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const submitQuest = () => {
    const title = form.title.trim();
    if (!title || pending) return;

    startTransition(async () => {
      const payload = {
        ...form,
        title,
        description: form.description.trim() || "Habit tambahan untuk progres harianmu.",
      };
      const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        push({ title: editingId ? "Gagal update quest" : "Gagal menambah habit", variant: "error" });
        return;
      }

      push({ title: editingId ? "Quest berhasil diupdate" : "Habit baru ditambahkan", variant: "success" });
      resetForm();
      emitTasksUpdatedEvent();
      await loadTasks();
    });
  };

  const editQuest = (task: TaskRecord) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      difficulty: task.difficulty,
      expReward: task.expReward,
      coinReward: task.coinReward,
      streakImpact: task.streakImpact,
      durationMinutes: task.durationMinutes ?? 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuest = (task: TaskRecord) => {
    if (pending) return;
    const confirmed = window.confirm(`Hapus quest "${task.title}"?`);
    if (!confirmed) return;

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!response.ok) {
        push({ title: "Gagal menghapus quest", variant: "error" });
        return;
      }
      push({ title: "Quest dihapus", variant: "success" });
      if (editingId === task.id) resetForm();
      emitTasksUpdatedEvent();
      await loadTasks();
    });
  };

  const completeQuest = (task: TaskRecord) => {
    if (task.completedToday || pending) return;

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
      if (!response.ok) {
        push({ title: "Gagal menyelesaikan quest", variant: "error" });
        return;
      }
      const payload = await response.json().catch(() => null) as {
        bossBattle?: {
          damageApplied: number;
          source?: string;
          taskCategory?: string;
          taskDifficulty?: string;
          weaknessTriggered?: boolean;
          damageMultiplier?: number;
          defeated: boolean;
          boss?: { name?: string };
          rewards?: { exp?: number; coins?: number; item?: { name?: string | null } | null } | null;
        } | null;
      } | null;
      push({ title: "Quest selesai. Reward masuk!", variant: "success" });
      if (payload?.bossBattle) {
        emitBossDamageEvent({
          damage: payload.bossBattle.damageApplied,
          source: payload.bossBattle.source ?? task.title,
          bossName: payload.bossBattle.boss?.name,
          category: payload.bossBattle.taskCategory,
          difficulty: payload.bossBattle.taskDifficulty,
          weaknessTriggered: payload.bossBattle.weaknessTriggered,
          damageMultiplier: payload.bossBattle.damageMultiplier,
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
      emitTasksUpdatedEvent();
      await loadTasks();
    });
  };

  return (
    <section className="quest-board">
      <div className="quest-hero">
        <div>
          <p className="eyebrow">Mission Board</p>
          <h2>Quest & Habit</h2>
          <p>Tambah habit, edit target harian, lalu claim reward ketika selesai.</p>
        </div>
        <button className="icon-button" onClick={loadTasks} disabled={loading || pending} type="button">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="summary-grid">
        <Summary label="Total Quest" value={tasks.length.toString()} />
        <Summary label="Selesai Hari Ini" value={doneCount.toString()} />
        <Summary label="Progress" value={`${completion}%`} />
      </div>

      <div className="quest-layout">
        <div className="quest-form">
          <div className="form-head">
            <div>
              <p className="eyebrow">{editingId ? "Edit Habit" : "Create Habit"}</p>
              <h3>{editingId ? "Perbarui quest" : "Tambah habit baru"}</h3>
            </div>
            {editingId && (
              <button className="ghost-button" onClick={resetForm} type="button">
                <X size={15} />
                Batal
              </button>
            )}
          </div>

          <label>
            Nama habit
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Contoh: Baca 10 halaman"
            />
          </label>
          <label>
            Deskripsi
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Apa ritual kecil yang harus dilakukan?"
              rows={3}
            />
          </label>

          <div className="field-grid">
            <label>
              Kategori
              <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}>
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select value={form.difficulty} onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}>
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid four">
            <NumberField label="EXP" value={form.expReward} onChange={(value) => setForm((prev) => ({ ...prev, expReward: value }))} />
            <NumberField label="Coins" value={form.coinReward} onChange={(value) => setForm((prev) => ({ ...prev, coinReward: value }))} />
            <NumberField label="Streak" value={form.streakImpact} onChange={(value) => setForm((prev) => ({ ...prev, streakImpact: value }))} />
            <NumberField label="Menit" value={form.durationMinutes} onChange={(value) => setForm((prev) => ({ ...prev, durationMinutes: value }))} />
          </div>

          <button className="primary-button" onClick={submitQuest} disabled={!form.title.trim() || pending} type="button">
            {editingId ? <Save size={16} /> : <Plus size={16} />}
            {editingId ? "Simpan perubahan" : "Tambah habit"}
          </button>
        </div>

        <div className="quest-list">
          <QuestGroup
            title="Habit Buatanmu"
            emptyText="Belum ada habit custom. Tambahkan dari form di sebelah kiri."
            tasks={customTasks}
            pending={pending}
            onComplete={completeQuest}
            onEdit={editQuest}
            onDelete={deleteQuest}
          />
          <QuestGroup
            title="System Quest"
            emptyText="System quest belum tersedia."
            tasks={systemTasks}
            pending={pending}
            onComplete={completeQuest}
          />
        </div>
      </div>

      <style>{`
        .quest-board { display: flex; flex-direction: column; gap: 16px; }
        .quest-hero, .quest-form, .quest-group {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(15,23,42,0.88), rgba(4,8,18,0.96));
          color: white;
        }
        .quest-hero { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 24px; }
        .quest-hero h2, .quest-form h3 { margin: 0; font-size: 28px; font-weight: 900; }
        .quest-hero p:not(.eyebrow) { margin-top: 6px; color: rgba(226,232,240,0.58); font-size: 14px; }
        .eyebrow { margin: 0 0 5px; color: #d4a843; font-family: var(--font-mono); font-size: 10px; font-weight: 800; letter-spacing: 0.28em; text-transform: uppercase; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .summary-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; background: rgba(255,255,255,0.035); padding: 16px; color: white; }
        .summary-card strong { display: block; font-size: 24px; }
        .summary-card span { color: rgba(226,232,240,0.45); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; }
        .quest-layout { display: grid; grid-template-columns: minmax(320px, 0.78fr) minmax(0, 1.22fr); gap: 16px; align-items: start; }
        .quest-form { padding: 18px; position: sticky; top: 70px; }
        .form-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
        .quest-form label { display: flex; flex-direction: column; gap: 7px; color: rgba(226,232,240,0.58); font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .quest-form input, .quest-form textarea, .quest-form select {
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          background: rgba(2,6,23,0.72);
          color: white;
          padding: 10px 12px;
          outline: none;
        }
        .quest-form textarea { resize: vertical; min-height: 76px; }
        .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .field-grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .primary-button, .ghost-button, .icon-button, .mini-button {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer; font-weight: 850;
        }
        .primary-button { width: 100%; margin-top: 4px; padding: 12px; background: linear-gradient(90deg,#7c3aed,#22d3ee); color: white; }
        .ghost-button, .icon-button { padding: 9px 12px; background: rgba(255,255,255,0.04); color: rgba(226,232,240,0.72); }
        .primary-button:disabled, .ghost-button:disabled, .icon-button:disabled, .mini-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .quest-list { display: flex; flex-direction: column; gap: 14px; }
        .quest-group { overflow: hidden; }
        .quest-group-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .quest-group-head h3 { margin: 0; font-size: 17px; font-weight: 900; }
        .quest-group-head span { color: rgba(226,232,240,0.45); font-size: 12px; }
        .empty-state { padding: 22px 16px; color: rgba(226,232,240,0.42); font-size: 13px; }
        .quest-item { display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 15px 16px; border-bottom: 1px solid rgba(255,255,255,0.055); }
        .quest-item:last-child { border-bottom: 0; }
        .quest-item.done { opacity: 0.54; }
        .quest-title { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .quest-title strong { font-size: 14px; }
        .quest-desc { margin-top: 6px; color: rgba(226,232,240,0.5); font-size: 12px; line-height: 1.5; }
        .quest-chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .chip { border: 1px solid rgba(255,255,255,0.07); border-radius: 999px; background: rgba(255,255,255,0.045); padding: 3px 8px; color: rgba(226,232,240,0.66); font-family: var(--font-mono); font-size: 10px; }
        .difficulty { border-radius: 7px; padding: 3px 8px; font-family: var(--font-mono); font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .quest-actions { display: flex; align-items: flex-start; gap: 7px; }
        .mini-button { width: 34px; height: 34px; background: rgba(255,255,255,0.045); color: rgba(226,232,240,0.78); }
        .mini-button.danger { border-color: rgba(239,68,68,0.28); color: #fca5a5; }
        @media (max-width: 980px) {
          .quest-layout { grid-template-columns: 1fr; }
          .quest-form { position: relative; top: auto; }
        }
        @media (max-width: 640px) {
          .quest-hero, .quest-item { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
          .summary-grid, .field-grid, .field-grid.four { grid-template-columns: 1fr; }
          .quest-actions { justify-content: flex-start; }
        }
      `}</style>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      {label}
      <input
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function QuestGroup({
  title,
  emptyText,
  tasks,
  pending,
  onComplete,
  onEdit,
  onDelete,
}: {
  title: string;
  emptyText: string;
  tasks: TaskRecord[];
  pending: boolean;
  onComplete: (task: TaskRecord) => void;
  onEdit?: (task: TaskRecord) => void;
  onDelete?: (task: TaskRecord) => void;
}) {
  return (
    <div className="quest-group">
      <div className="quest-group-head">
        <h3>{title}</h3>
        <span>{tasks.length} item</span>
      </div>
      {tasks.length === 0 ? (
        <div className="empty-state">{emptyText}</div>
      ) : (
        tasks.map((task) => (
          <QuestRow
            key={task.id}
            task={task}
            pending={pending}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

function QuestRow({
  task,
  pending,
  onComplete,
  onEdit,
  onDelete,
}: {
  task: TaskRecord;
  pending: boolean;
  onComplete: (task: TaskRecord) => void;
  onEdit?: (task: TaskRecord) => void;
  onDelete?: (task: TaskRecord) => void;
}) {
  const difficulty = DIFFICULTIES.find((item) => item.value === task.difficulty) ?? DIFFICULTIES[0]!;

  return (
    <div className={`quest-item ${task.completedToday ? "done" : ""}`}>
      <div>
        <div className="quest-title">
          <strong>{task.title}</strong>
          <span className="difficulty" style={{ color: difficulty.color, border: `1px solid ${difficulty.color}55`, background: `${difficulty.color}18` }}>
            {difficulty.label}
          </span>
        </div>
        <p className="quest-desc">{task.description}</p>
        <div className="quest-chip-row">
          <span className="chip">{task.category.replace("_", " ")}</span>
          <span className="chip">+{task.expReward} EXP</span>
          <span className="chip">+{task.coinReward} coins</span>
          <span className="chip">streak +{task.streakImpact}</span>
          {task.durationMinutes ? <span className="chip">{task.durationMinutes} min</span> : null}
          {task.completedToday ? <span className="chip">done today</span> : null}
        </div>
      </div>
      <div className="quest-actions">
        <button className="mini-button" onClick={() => onComplete(task)} disabled={task.completedToday || pending} title="Complete" type="button">
          <Check size={15} />
        </button>
        {onEdit && (
          <button className="mini-button" onClick={() => onEdit(task)} disabled={pending} title="Edit" type="button">
            <Edit3 size={15} />
          </button>
        )}
        {onDelete && (
          <button className="mini-button danger" onClick={() => onDelete(task)} disabled={pending} title="Delete" type="button">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
