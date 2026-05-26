import { Flame, Gift, Swords, Trophy, UserRound, Zap } from "lucide-react";

type Feature = {
  icon: typeof Swords;
  title: string;
  desc: string;
  tag: string;
  tone: "gold" | "violet" | "rose" | "teal";
};

const FEATURES: Feature[] = [
  {
    icon: Swords,
    title: "Boss yang Menantikan",
    desc: "Penundaan berubah menjadi musuh aktif. Semakin lama kamu diam, semakin tebal HP yang harus ditembus.",
    tag: "Combat",
    tone: "gold",
  },
  {
    icon: UserRound,
    title: "Identitas yang Nyata",
    desc: "Pilih class, bangun reputasi, dan lihat karaktermu berkembang sesuai ritme hidupmu sendiri.",
    tag: "Identity",
    tone: "violet",
  },
  {
    icon: Flame,
    title: "Streak Punya Jiwa",
    desc: "Streak bukan dekorasi angka. Ia jadi tekanan, perlindungan, dan bukti bahwa kamu terus hadir.",
    tag: "Retention",
    tone: "rose",
  },
  {
    icon: Gift,
    title: "Daily Chest",
    desc: "Reward harian membuat rutinitas terasa punya konsekuensi: simpan, pakai, dan upgrade progresmu.",
    tag: "Daily Loop",
    tone: "teal",
  },
  {
    icon: Zap,
    title: "Combo Multiplier",
    desc: "Aksi yang konsisten terasa makin kuat. Momentum kecil berubah menjadi damage besar.",
    tag: "Feedback",
    tone: "gold",
  },
  {
    icon: Trophy,
    title: "PvP & Guild",
    desc: "Bersaing sehat, bangun aliansi, dan jadikan progres personal terasa hidup bersama pemain lain.",
    tag: "Social",
    tone: "rose",
  },
];

export function LandingFeatures() {
  return (
    <section className="landing-features">
      <div className="section-divider">
        <span />
        <p>System Online</p>
        <span />
      </div>

      <div className="features-heading">
        <h2>Bukan productivity app biasa.</h2>
        <p>Setiap ritual harian punya bobot dalam dunia game yang hidup.</p>
      </div>

      <div className="features-grid">
        {FEATURES.map(({ icon: Icon, title, desc, tag, tone }) => (
          <article key={title} className={`feature-card ${tone}`}>
            <div className="feature-icon">
              <Icon aria-hidden />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            <strong>{tag}</strong>
          </article>
        ))}
      </div>

      <style>{`
        .landing-features {
          position: relative;
          z-index: 1;
          padding: 0 0 54px;
        }

        .section-divider {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 18px;
          margin-bottom: 20px;
        }

        .section-divider span {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.74), transparent);
        }

        .section-divider p {
          margin: 0;
          color: #a855f7;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.34em;
          text-transform: uppercase;
        }

        .features-heading {
          margin: 0 auto 28px;
          max-width: 680px;
          text-align: center;
        }

        .features-heading h2 {
          margin: 0;
          color: #fff;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.12;
        }

        .features-heading p {
          margin: 10px 0 0;
          color: rgba(226, 232, 240, 0.64);
          font-size: 15px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .feature-card {
          position: relative;
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 18px 20px;
          min-height: 168px;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 15px;
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(3, 7, 18, 0.76)),
            rgba(3, 7, 18, 0.88);
          padding: 26px;
          box-shadow: inset 0 0 28px rgba(124, 58, 237, 0.08);
        }

        .feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0.26;
          pointer-events: none;
        }

        .feature-card.gold {
          border-color: rgba(250, 204, 21, 0.56);
        }

        .feature-card.gold::before {
          background: radial-gradient(circle at 0% 0%, rgba(250, 204, 21, 0.28), transparent 44%);
        }

        .feature-card.violet {
          border-color: rgba(139, 92, 246, 0.68);
        }

        .feature-card.violet::before {
          background: radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.38), transparent 44%);
        }

        .feature-card.rose {
          border-color: rgba(244, 114, 182, 0.58);
        }

        .feature-card.rose::before {
          background: radial-gradient(circle at 0% 0%, rgba(244, 114, 182, 0.26), transparent 44%);
        }

        .feature-card.teal {
          border-color: rgba(45, 212, 191, 0.58);
        }

        .feature-card.teal::before {
          background: radial-gradient(circle at 0% 0%, rgba(45, 212, 191, 0.24), transparent 44%);
        }

        .feature-icon {
          position: relative;
          z-index: 1;
          display: grid;
          width: 58px;
          height: 58px;
          place-items: center;
          color: #fff;
        }

        .feature-icon svg {
          width: 44px;
          height: 44px;
          filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.72));
        }

        .feature-card.gold .feature-icon svg {
          color: #facc15;
          filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.72));
        }

        .feature-card.violet .feature-icon svg {
          color: #a78bfa;
        }

        .feature-card.rose .feature-icon svg {
          color: #fb7185;
          filter: drop-shadow(0 0 16px rgba(251, 113, 133, 0.72));
        }

        .feature-card.teal .feature-icon svg {
          color: #2dd4bf;
          filter: drop-shadow(0 0 16px rgba(45, 212, 191, 0.72));
        }

        .feature-card h3 {
          position: relative;
          z-index: 1;
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
        }

        .feature-card p {
          position: relative;
          z-index: 1;
          margin: 12px 0 0;
          color: rgba(203, 213, 225, 0.62);
          font-size: 13px;
          line-height: 1.75;
        }

        .feature-card strong {
          position: relative;
          z-index: 1;
          grid-column: 1 / -1;
          align-self: end;
          color: #facc15;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .feature-card.violet strong {
          color: #c084fc;
        }

        .feature-card.rose strong {
          color: #fb7185;
        }

        .feature-card.teal strong {
          color: #2dd4bf;
        }

        @media (max-width: 980px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-card {
            grid-template-columns: 52px 1fr;
            padding: 20px;
          }

          .features-heading h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </section>
  );
}
