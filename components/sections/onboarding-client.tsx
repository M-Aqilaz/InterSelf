
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Class definitions ───────────────────
type ClassDef = {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  desc: string;
  bonus: string;
  bonusColor: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  sprite: React.ReactNode;
};

function SageSprite() {
  return (
    <svg viewBox="0 0 52 70" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="26" cy="65" rx="16" ry="4" fill="#7c3aed" opacity=".15"/>
      <path d="M8 30 Q4 46 6 62 Q26 60 46 62 Q48 46 44 30 Q34 24 26 23 Q18 24 8 30Z" fill="#1e1040"/>
      <path d="M12 34 Q9 46 9.5 61 Q26 59.5 42.5 61 Q43 46 40 34" fill="#2a1858"/>
      <path d="M17 38 Q14 50 15 61 Q26 60 37 61 Q38 50 35 38 Q26 34 17 38Z" fill="#3b1f75" opacity=".7"/>
      <path d="M22 46 L26 40 L30 46 L26 52Z" fill="none" stroke="#a78bfa" strokeWidth="1.2"/>
      <circle cx="26" cy="46" r="2" fill="#c4b5fd"/>
      <circle cx="4.5" cy="42" r="3.5" fill="#2a1858"/><circle cx="4.5" cy="42" r="2" fill="#7c3aed" opacity=".7"/>
      <circle cx="47.5" cy="42" r="3.5" fill="#2a1858"/><circle cx="47.5" cy="42" r="2" fill="#06b6d4" opacity=".7"/>
      <ellipse cx="26" cy="18" rx="11" ry="12" fill="#1e1040"/>
      <ellipse cx="26" cy="19" rx="9.5" ry="10.5" fill="#251450"/>
      <ellipse cx="22.5" cy="18" rx="2.5" ry="2" fill="#7c3aed"/>
      <ellipse cx="29.5" cy="18" rx="2.5" ry="2" fill="#7c3aed"/>
      <ellipse cx="22.5" cy="18" rx="1.2" ry="1" fill="#c4b5fd"/>
      <ellipse cx="29.5" cy="18" rx="1.2" ry="1" fill="#c4b5fd"/>
      <path d="M15 13 Q15.5 5 26 4 Q36.5 5 37 13 Q33 8.5 26 8 Q19 8.5 15 13Z" fill="#0f0825"/>
      <path d="M15 13 Q9 20 11 27 Q15 28 18 26 Q15 22 16 16Z" fill="#0f0825"/>
      <path d="M37 13 Q43 20 41 27 Q37 28 34 26 Q37 22 36 16Z" fill="#0f0825"/>
    </svg>
  );
}

function IroncladSprite() {
  return (
    <svg viewBox="0 0 52 70" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="26" cy="65" rx="17" ry="4" fill="#dc2626" opacity=".15"/>
      <path d="M6 30 Q3 46 4 62 Q26 60 48 62 Q49 46 46 30 Q36 23 26 22 Q16 23 6 30Z" fill="#1c0a0a"/>
      <path d="M9 33 Q7 46 7 61 Q26 59.5 45 61 Q45 46 43 33" fill="#2d1010"/>
      <rect x="14" y="34" width="24" height="26" rx="3" fill="#1a0808"/>
      <path d="M14 40 L38 40 M14 48 L38 48 M14 56 L38 56" stroke="#dc2626" strokeWidth=".8" opacity=".4"/>
      <rect x="3" y="38" width="8" height="16" rx="2.5" fill="#2d1010"/>
      <path d="M4 41 L9 41 M4 45 L9 45 M4 49 L9 49 M4 53 L9 53" stroke="#dc2626" strokeWidth=".8" opacity=".5"/>
      <rect x="41" y="38" width="8" height="16" rx="2.5" fill="#2d1010"/>
      <path d="M42 41 L47 41 M42 45 L47 45 M42 49 L47 49 M42 53 L47 53" stroke="#dc2626" strokeWidth=".8" opacity=".5"/>
      <rect x="16" y="22" width="20" height="10" rx="2.5" fill="#1c0a0a"/>
      <ellipse cx="26" cy="14" rx="14" ry="15" fill="#1c0a0a"/>
      <rect x="13" y="6" width="26" height="20" rx="4" fill="#2d1010"/>
      <rect x="15" y="8" width="22" height="16" rx="3" fill="#1c0a0a"/>
      <rect x="18" y="11" width="16" height="10" rx="2" fill="#0d0404"/>
      <ellipse cx="21.5" cy="16" rx="3" ry="2.5" fill="#dc2626" opacity=".9"/>
      <ellipse cx="30.5" cy="16" rx="3" ry="2.5" fill="#dc2626" opacity=".9"/>
      <ellipse cx="21.5" cy="16" rx="1.5" ry="1.2" fill="#fca5a5"/>
      <ellipse cx="30.5" cy="16" rx="1.5" ry="1.2" fill="#fca5a5"/>
      <path d="M16 5 L22 -2 L26 5Z" fill="#1c0a0a"/>
      <path d="M36 5 L30 -2 L26 5Z" fill="#1c0a0a"/>
    </svg>
  );
}

function PhantomSprite() {
  return (
    <svg viewBox="0 0 52 70" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="26" cy="65" rx="15" ry="3.5" fill="#6d28d9" opacity=".1"/>
      <path d="M8 30 Q4 46 5 64 Q26 61 47 64 Q48 46 44 30 Q35 22 26 21 Q17 22 8 30Z" fill="#0d0818" opacity=".9"/>
      <path d="M10 33 Q7 46 8 63 Q26 60 44 63 Q45 46 42 33" fill="#140d24" opacity=".8"/>
      <ellipse cx="26" cy="46" rx="10" ry="14" fill="#0a0615" opacity=".9"/>
      <ellipse cx="26" cy="44" rx="5" ry="7" fill="#6d28d9" opacity=".4"/>
      <circle cx="3.5" cy="43" r="3" fill="#140d24"/><circle cx="3.5" cy="43" r="1.8" fill="#8b5cf6" opacity=".5"/>
      <circle cx="48.5" cy="43" r="3" fill="#140d24"/><circle cx="48.5" cy="43" r="1.8" fill="#a78bfa" opacity=".5"/>
      <path d="M5 63 Q9 68 13 68.5 Q12 65 10 63Z" fill="#0d0818"/>
      <path d="M47 63 Q43 68 39 68.5 Q40 65 42 63Z" fill="#0d0818"/>
      <path d="M20 63 Q24 69 28 63Z" fill="#0d0818"/>
      <ellipse cx="26" cy="14" rx="12" ry="13" fill="#0d0818" opacity=".95"/>
      <ellipse cx="26" cy="15" rx="10" ry="11" fill="#140d24"/>
      <ellipse cx="21.5" cy="14" rx="3" ry="2.5" fill="#8b5cf6"/>
      <ellipse cx="30.5" cy="14" rx="3" ry="2.5" fill="#8b5cf6"/>
      <ellipse cx="21.5" cy="14" rx="1.4" ry="1.1" fill="#ddd6fe"/>
      <ellipse cx="30.5" cy="14" rx="1.4" ry="1.1" fill="#ddd6fe"/>
      <path d="M14 6 Q14.5 1 26 0 Q37.5 1 38 6 Q34 2.5 26 2 Q18 2.5 14 6Z" fill="#0a0615"/>
      <path d="M14 6 Q8 14 10 22 Q14 23 18 21 Q14 16.5 15 10Z" fill="#0a0615"/>
      <path d="M38 6 Q44 14 42 22 Q38 23 34 21 Q38 16.5 37 10Z" fill="#0a0615"/>
    </svg>
  );
}

function MerchantSprite() {
  return (
    <svg viewBox="0 0 52 70" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="26" cy="65" rx="17" ry="4" fill="#d97706" opacity=".12"/>
      <path d="M7 30 Q4 46 5 62 Q26 60 47 62 Q48 46 45 30 Q35 23 26 22 Q17 23 7 30Z" fill="#1c1204"/>
      <path d="M10 33 Q8 46 8 61 Q26 59.5 44 61 Q44 46 42 33" fill="#2d1e06"/>
      <path d="M14 34 L38 34 L39 61 L13 61Z" fill="#1a1203"/>
      <circle cx="26" cy="44" r="5" fill="#d97706" opacity=".5"/>
      <circle cx="26" cy="44" r="2.5" fill="#fcd34d" opacity=".7"/>
      <circle cx="4" cy="43" r="3.5" fill="#2d1e06"/>
      <circle cx="48" cy="43" r="3.5" fill="#2d1e06"/>
      <rect x="16" y="22" width="20" height="10" rx="3" fill="#1c1204"/>
      <ellipse cx="26" cy="13" rx="13" ry="14" fill="#1c1204"/>
      <path d="M11 8 L26 1 L41 8 L39 16 L13 16Z" fill="#1c1204"/>
      <path d="M12 8.5 L26 2 L40 8.5 L38.5 15.5 L13.5 15.5Z" fill="#2d1e06"/>
      <path d="M14 10.5 L26 4 L38 10.5 L36.5 15 L15.5 15Z" fill="#d97706" opacity=".15"/>
      <circle cx="26" cy="1" r="3" fill="#d97706" opacity=".8"/>
      <circle cx="26" cy="1" r="1.5" fill="#fcd34d"/>
      <ellipse cx="20" cy="15" rx="2" ry="1.6" fill="#d97706" opacity=".9"/>
      <ellipse cx="32" cy="15" rx="2" ry="1.6" fill="#d97706" opacity=".9"/>
    </svg>
  );
}

const CLASSES: ClassDef[] = [
  {
    id: "SAGE",
    name: "Sage",
    icon: "📚",
    subtitle: "Knowledge",
    desc: "Penguasa ilmu. Setiap sumber pengetahuan adalah senjatamu. Cocok untuk pelajar, developer, dan mereka yang hidup dari ide.",
    bonus: "+15% EXP dari task Study & Focus · +INT +FOC",
    bonusColor: "#a78bfa",
    borderColor: "rgba(167,139,250,0.3)",
    bgColor: "rgba(124,58,237,0.06)",
    glowColor: "rgba(124,58,237,0.15)",
    sprite: <SageSprite />,
  },
  {
    id: "IRONCLAD",
    name: "Ironclad",
    icon: "⚔️",
    subtitle: "Discipline",
    desc: "Disiplin absolut. Tidak kenal lelah, tidak kenal alasan. Untuk mereka yang mau bertarung di garis terdepan setiap hari.",
    bonus: "+15% EXP dari task Hard & Legendary · +DIS +FIT",
    bonusColor: "var(--rose-light)",
    borderColor: "rgba(224,90,106,0.3)",
    bgColor: "rgba(224,90,106,0.06)",
    glowColor: "rgba(224,90,106,0.15)",
    sprite: <IroncladSprite />,
  },
  {
    id: "PHANTOM",
    name: "Phantom",
    icon: "🌙",
    subtitle: "Consistency",
    desc: "Konsisten dalam bayangan. Tidak terlihat tapi selalu ada. Streak adalah nyawa kelas ini — bonus terbesar untuk mereka yang tidak pernah berhenti.",
    bonus: "Streak putus hanya -50% (bukan reset) · +CON +FOC",
    bonusColor: "#8b5cf6",
    borderColor: "rgba(139,92,246,0.3)",
    bgColor: "rgba(109,40,217,0.06)",
    glowColor: "rgba(109,40,217,0.15)",
    sprite: <PhantomSprite />,
  },
  {
    id: "MERCHANT",
    name: "Merchant",
    icon: "💰",
    subtitle: "Wealth",
    desc: "Setiap misi adalah investasi. Coin adalah bahasa universal. Untuk mereka yang ingin memaksimalkan reward dari setiap aksi.",
    bonus: "+20% Coins dari semua task · +FIN +CON",
    bonusColor: "var(--gold)",
    borderColor: "rgba(212,168,67,0.3)",
    bgColor: "rgba(212,168,67,0.06)",
    glowColor: "rgba(212,168,67,0.15)",
    sprite: <MerchantSprite />,
  },
];

// ─── Main Component ───────────────────────
type Step = 1 | 2 | 3;

export function OnboardingClient() {
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const confirmClass = useCallback(async () => {
    if (!selected || confirming) return;
    setConfirming(true);
    setError(null);

    const res = await fetch("/api/profile/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterClass: selected }),
    });

    if (res.ok) {
      setStep(3);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal memilih class");
    }
    setConfirming(false);
  }, [selected, confirming]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient blobs */}
      <div aria-hidden style={{ position: "absolute", top: "-80px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "var(--gold)", filter: "blur(100px)", opacity: 0.07, pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-60px", right: "-40px", width: "240px", height: "240px", borderRadius: "50%", background: "var(--rose)", filter: "blur(90px)", opacity: 0.06, pointerEvents: "none" }} />

      {/* Progress bar */}
      <div style={{ display: "flex", gap: "6px", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              flex: 1, height: "2px", borderRadius: "1px",
              background: n < step ? "var(--gold)" : n === step ? "var(--gold-dim)" : "var(--border-2)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <AnimatePresence mode="wait">

          {/* STEP 1 — Narasi */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ maxWidth: "480px", textAlign: "center" }}
            >
              <div className="badge-gold" style={{ marginBottom: "20px" }}>
                Selamat Datang, Adventurer
              </div>

              <h1 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 700, color: "var(--t1)", lineHeight: 1.2, marginBottom: "14px" }}>
                Dunia sedang dikuasai<br />Kegelapan Prokrastinasi.
              </h1>

              <p style={{ fontSize: "14px", color: "var(--t2)", lineHeight: 1.75, marginBottom: "24px" }}>
                Setiap hari yang kamu lewati tanpa aksi memperkuatnya.
                Tapi kamu tidak sendirian — dan ada cara untuk melawan.
              </p>

              {/* Terminal threat assessment */}
              <div
                style={{
                  borderRadius: "14px", border: "1px solid rgba(224,90,106,0.2)",
                  background: "rgba(224,90,106,0.05)", padding: "16px 18px",
                  marginBottom: "28px", textAlign: "left",
                  fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--rose-light)",
                  lineHeight: 1.8,
                }}
              >
                <div style={{ fontSize: "8px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                  Threat Assessment
                </div>
                <div>BOSS: PROKRASTINASI ABYSSAL</div>
                <div>STATUS: ACTIVE · HP: ████████ 100%</div>
                <div>WEAKNESS: FOCUS_TASKS · HARD_TASKS</div>
                <div style={{ marginTop: "8px", color: "var(--gold)" }}>
                  → Membutuhkan adventurer untuk dikalahkan.
                </div>
              </div>

              <button className="btn-gold" onClick={() => setStep(2)} style={{ width: "100%", maxWidth: "280px", justifyContent: "center" }}>
                Aku siap melawan →
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Pilih kelas */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ width: "100%", maxWidth: "520px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--t1)", marginBottom: "6px" }}>
                  Pilih kelasmu.
                </h2>
                <p style={{ fontSize: "12px", color: "var(--t3)" }}>
                  Tidak bisa diubah kecuali dengan item langka Class Crystal.
                </p>
              </div>

              {/* Class grid */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "10px", marginBottom: "20px",
                }}
              >
                {CLASSES.map((cls) => {
                  const isSel = selected === cls.id;
                  return (
                    <motion.button
                      key={cls.id}
                      onClick={() => setSelected(cls.id)}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        borderRadius: "14px",
                        border: `1px solid ${isSel ? cls.borderColor : "var(--border)"}`,
                        background: isSel ? cls.bgColor : "var(--bg-1)",
                        padding: "14px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        position: "relative",
                        boxShadow: isSel ? `0 0 24px ${cls.glowColor}` : "none",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {isSel && (
                        <div
                          style={{
                            position: "absolute", top: "10px", right: "10px",
                            width: "18px", height: "18px", borderRadius: "50%",
                            background: "var(--gold)", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: "9px", fontWeight: 700, color: "var(--bg-base)",
                          }}
                        >
                          ✓
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ width: "42px", height: "56px", flexShrink: 0 }}>
                          {cls.sprite}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--t1)" }}>{cls.name}</div>
                          <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: cls.bonusColor, fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                            {cls.subtitle}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", lineHeight: 1.5, marginBottom: "8px" }}>
                        {cls.desc}
                      </div>
                      <div style={{ fontSize: "9px", fontWeight: 600, color: cls.bonusColor, fontFamily: "var(--font-mono)" }}>
                        {cls.bonus}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {error && (
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--rose)", marginBottom: "12px" }}>
                  {error}
                </p>
              )}

              <button
                className="btn-gold"
                disabled={!selected || confirming}
                onClick={confirmClass}
                style={{ width: "100%", justifyContent: "center", opacity: !selected ? 0.4 : 1, cursor: !selected ? "not-allowed" : "pointer" }}
              >
                {confirming ? "Mengaktifkan kelas..." : selected ? `Konfirmasi ${CLASSES.find(c => c.id === selected)?.name} →` : "Pilih kelas dulu"}
              </button>
            </motion.div>
          )}

          {/* STEP 3 — Boss intro */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ maxWidth: "380px", textAlign: "center" }}
            >
              <div className="badge-gold" style={{ marginBottom: "16px" }}>
                Boss Pertamamu
              </div>

              {/* Boss sprite */}
              <div style={{ width: "100px", height: "130px", margin: "0 auto 16px" }}>
                <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", animation: "char-float 3s ease-in-out infinite" }}>
                  <ellipse cx="50" cy="122" rx="36" ry="7" fill="#dc2626" opacity=".12"/>
                  <path d="M16 60 Q8 92 10 120 Q50 115 90 120 Q92 92 84 60 Q66 48 50 46 Q34 48 16 60Z" fill="#1a0505"/>
                  <path d="M18 62 Q12 88 12 118 Q50 113 88 118 Q88 88 82 62" fill="#240808"/>
                  <ellipse cx="50" cy="86" rx="18" ry="22" fill="#0d0202"/>
                  <ellipse cx="50" cy="86" rx="10" ry="14" fill="#dc2626" opacity=".8"/>
                  <ellipse cx="50" cy="86" rx="5" ry="7" fill="#fca5a5" opacity=".9"/>
                  <path d="M16 62 Q4 70 2 83 Q8 80 13 72" fill="#1a0505"/>
                  <path d="M84 62 Q96 70 98 83 Q92 80 87 72" fill="#1a0505"/>
                  <path d="M2 82 L-3 90 M2 82 L0 92 M2 82 L7 90" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
                  <path d="M98 82 L103 90 M98 82 L100 92 M98 82 L93 90" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
                  <ellipse cx="50" cy="30" rx="26" ry="28" fill="#0d0202"/>
                  <ellipse cx="50" cy="32" rx="22" ry="24" fill="#1a0505"/>
                  <ellipse cx="38" cy="28" rx="8" ry="7" fill="#0d0202"/>
                  <ellipse cx="62" cy="28" rx="8" ry="7" fill="#0d0202"/>
                  <ellipse cx="38" cy="28" rx="5.5" ry="4.5" fill="#dc2626"/>
                  <ellipse cx="62" cy="28" rx="5.5" ry="4.5" fill="#dc2626"/>
                  <ellipse cx="38" cy="28" rx="2.5" ry="2" fill="#fca5a5"/>
                  <ellipse cx="62" cy="28" rx="2.5" ry="2" fill="#fca5a5"/>
                  <path d="M38 40 Q50 48 62 40" fill="#0d0202" stroke="#dc2626" strokeWidth="1.5" opacity=".7"/>
                  <path d="M27 14 Q20 2 30 -2 Q34 10 34 18" fill="#1a0505"/>
                  <path d="M73 14 Q80 2 70 -2 Q66 10 66 18" fill="#1a0505"/>
                </svg>
              </div>

              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--t1)", marginBottom: "4px" }}>
                Prokrastinasi Abyssal
              </h2>
              <p style={{ fontSize: "11px", color: "var(--rose)", fontStyle: "italic", marginBottom: "16px" }}>
                &quot;Pemangsa dari Kekosongan&quot; · Tier F · Hollow Cradle
              </p>

              {/* Boss HP bar */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--t3)", marginBottom: "5px", fontFamily: "var(--font-mono)" }}>
                  <span>HP Boss</span><span>8,000 / 8,000</span>
                </div>
                <div className="bar-track" style={{ height: "8px", borderRadius: "4px", border: "1px solid rgba(224,90,106,0.15)" }}>
                  <div className="bar-fill bar-rose" style={{ width: "100%" }} />
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "var(--t3)", lineHeight: 1.7, marginBottom: "22px" }}>
                Boss ini menunggumu. Selesaikan misi harianmu untuk menyerangnya. Jangan biarkan dia memulihkan HP.
              </p>

              <button
                className="btn-gold"
                onClick={() => router.push("/dashboard")}
                style={{ width: "100%", maxWidth: "280px", justifyContent: "center" }}
              >
                Masuk ke arena →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

