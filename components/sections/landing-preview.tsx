import Link from "next/link";

const LOOP_STEPS = [
  {
    num: "01",
    title: "Pilih Kelas",
    desc: "Sage, Ironclad, Phantom, atau Merchant. Kelas menentukan bonus pasif dan identitas karaktermu.",
    color: "var(--gold)",
  },
  {
    num: "02",
    title: "Serang Boss",
    desc: "Setiap task yang selesai menyerang boss aktif. Combo berurutan = damage berlipat.",
    color: "var(--rose-light)",
  },
  {
    num: "03",
    title: "Naik Level",
    desc: "Boss kalah = dungeon baru terbuka, item langka drop, stat naik permanen.",
    color: "var(--jade-light)",
  },
  {
    num: "04",
    title: "Bersaing",
    desc: "PvP duel 7 hari, leaderboard global, guild. Selalu ada yang menunggumu.",
    color: "var(--gold)",
  },
];

export function LandingPreview() {
  return (
    <section style={{ paddingBottom: "48px" }}>
      {/* Section header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div style={{ width: "16px", height: "1px", background: "var(--jade)" }} />
          <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--jade)", fontFamily: "var(--font-mono)" }}>
            Core Loop
          </span>
        </div>
        <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--t1)", marginBottom: "6px" }}>
          Empat langkah. Satu siklus.
        </h2>
        <p style={{ fontSize: "13px", color: "var(--t2)", maxWidth: "400px" }}>
          Setiap hari adalah chapter baru dalam perjalanan pengembangan dirimu.
        </p>
      </div>

      {/* Steps grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "32px" }}
        className="steps-grid"
      >
        {LOOP_STEPS.map((step, i) => (
          <div
            key={step.num}
            style={{
              borderRadius: "14px",
              border: "1px solid var(--border)",
              background: "var(--bg-1)",
              padding: "16px",
              position: "relative",
            }}
          >
            <div style={{ fontSize: "9px", fontWeight: 700, color: step.color, fontFamily: "var(--font-mono)", marginBottom: "10px", letterSpacing: "0.1em" }}>
              {step.num}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--t1)", marginBottom: "6px" }}>
              {step.title}
            </div>
            <div style={{ fontSize: "11px", color: "var(--t3)", lineHeight: 1.6 }}>
              {step.desc}
            </div>
            {i < LOOP_STEPS.length - 1 && (
              <div style={{ position: "absolute", right: "-7px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "var(--t4)", zIndex: 1 }}>
                ›
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA banner */}
      <div
        style={{
          borderRadius: "20px",
          border: "1px solid var(--border)",
          background: "linear-gradient(135deg,rgba(212,168,67,0.06),rgba(58,170,122,0.04))",
          padding: "36px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--t3)", fontFamily: "var(--font-mono)" }}>
          Siap memulai?
        </div>
        <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--t1)" }}>
          Mulai sekarang. Gratis.
        </h3>
        <p style={{ fontSize: "13px", color: "var(--t2)", maxWidth: "360px" }}>
          Tidak perlu kartu kredit. Pilih kelas karaktermu dan langsung masuk ke arena.
        </p>
        <Link href="/register" className="btn-gold" style={{ marginTop: "4px" }}>
          Pilih Kelasmu →
        </Link>
        <p style={{ fontSize: "11px", color: "var(--t3)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
            Masuk di sini
          </Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) { .steps-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 500px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}