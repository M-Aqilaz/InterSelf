type Feature = {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  borderColor: string;
  bgColor: string;
  tagColor: string;
};

const FEATURES: Feature[] = [
  {
    icon: "⚔️",
    title: "Boss yang Memulihkan",
    desc: "Tidak selesaikan task selama 2 jam? Boss HP-nya pulih. Ada harga nyata untuk setiap penundaan.",
    tag: "Combat",
    borderColor: "rgba(212,168,67,0.2)",
    bgColor: "rgba(212,168,67,0.04)",
    tagColor: "var(--gold)",
  },
  {
    icon: "◉",
    title: "Identitas yang Nyata",
    desc: "Kelas karakter dengan sprite animasi unik, stat yang tumbuh, dan bonus pasif berbeda per kelas.",
    tag: "Identity",
    borderColor: "rgba(168,139,255,0.2)",
    bgColor: "rgba(168,139,255,0.04)",
    tagColor: "#c4b5fd",
  },
  {
    icon: "🔥",
    title: "Streak Punya Jiwa",
    desc: "Putus satu hari = debuff 24 jam. Tujuh hari berturut = Streak Shield dari daily chest. Bukan hanya angka.",
    tag: "Retention",
    borderColor: "rgba(224,90,106,0.2)",
    bgColor: "rgba(224,90,106,0.04)",
    tagColor: "var(--rose-light)",
  },
  {
    icon: "🎁",
    title: "Daily Chest",
    desc: "Reward harian reset jam 00:00. Siklus 7 hari dengan reward makin besar. Selalu ada alasan untuk kembali.",
    tag: "Daily Loop",
    borderColor: "rgba(58,170,122,0.2)",
    bgColor: "rgba(58,170,122,0.04)",
    tagColor: "var(--jade-light)",
  },
  {
    icon: "⚡",
    title: "Combo Multiplier",
    desc: "Task berurutan tanpa jeda = combo naik. 5x combo = 2.5x EXP dan damage. Terasa seperti fighting game.",
    tag: "Feedback",
    borderColor: "rgba(212,168,67,0.2)",
    bgColor: "rgba(212,168,67,0.04)",
    tagColor: "var(--gold)",
  },
  {
    icon: "🏆",
    title: "PvP & Guild",
    desc: "Tantang teman dalam 7-hari productivity duel. Siapa lebih banyak task minggu ini menang coins + EXP.",
    tag: "Social",
    borderColor: "rgba(224,90,106,0.2)",
    bgColor: "rgba(224,90,106,0.04)",
    tagColor: "var(--rose-light)",
  },
];

export function LandingFeatures() {
  return (
    <section style={{ padding: "0 0 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-2)" }} />
          <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--t3)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
            Systems Online
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-2)" }} />
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 700, color: "var(--t1)", textAlign: "center", marginBottom: "8px" }}>
          Bukan productivity app biasa.
        </h2>
        <p style={{ fontSize: "14px", color: "var(--t2)", textAlign: "center", maxWidth: "440px", margin: "0 auto" }}>
          Setiap ritual harian punya bobot dalam dunia game yang hidup.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
        className="feat-grid"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              borderRadius: "16px",
              border: `1px solid ${f.borderColor}`,
              background: f.bgColor,
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            <div style={{ fontSize: "26px", marginBottom: "12px" }}>{f.icon}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--t1)", marginBottom: "6px" }}>
              {f.title}
            </div>
            <div style={{ fontSize: "11px", color: "var(--t3)", lineHeight: 1.65, flex: 1 }}>
              {f.desc}
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "inline-flex",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: f.tagColor,
                fontFamily: "var(--font-mono)",
              }}
            >
              {f.tag}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .feat-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .feat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
