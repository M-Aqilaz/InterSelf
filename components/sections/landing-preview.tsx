import { BarChart3, RefreshCw, Shield, Swords } from "lucide-react";
import Link from "next/link";

const LOOP_STEPS = [
  {
    num: "01",
    icon: Shield,
    title: "Pilih Kelas",
    desc: "Tentukan role, value, dan build-mu. Ini awal dari karakter yang kamu rawat.",
    tone: "violet",
  },
  {
    num: "02",
    icon: Swords,
    title: "Serang Boss",
    desc: "Task selesai menjadi damage untuk prokrastinasi, mager, dan distraksi.",
    tone: "rose",
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Naik Level",
    desc: "Quest harian membuka EXP, coins, item, dan dungeon baru.",
    tone: "teal",
  },
  {
    num: "04",
    icon: RefreshCw,
    title: "Berulang",
    desc: "Refleksi, upgrade kebiasaan, lalu mulai siklus berikutnya lebih kuat.",
    tone: "violet",
  },
];

export function LandingPreview() {
  return (
    <section className="landing-preview">
      <div className="loop-heading">
        <div className="loop-eyebrow">
          <span />
          Core Loop
        </div>
        <h2>Empat langkah. Satu siklus.</h2>
        <p>Setiap hari adalah chapter baru dalam perjalanan pengembangan dirimu.</p>
      </div>

      <div className="steps-grid">
        {LOOP_STEPS.map(({ num, icon: Icon, title, desc, tone }, index) => (
          <article key={num} className={`step-card ${tone}`}>
            <p>{num}</p>
            <div className="step-main">
              <div className="step-icon">
                <Icon aria-hidden />
              </div>
              <div>
                <h3>{title}</h3>
                <span>{desc}</span>
              </div>
            </div>
            {index < LOOP_STEPS.length - 1 && <b aria-hidden>›</b>}
          </article>
        ))}
      </div>

      <div className="final-cta">
        <div className="cta-sigil left" />
        <div className="cta-sigil right" />
        <p>Siap Memulai?</p>
        <h2>
          Mulai sekarang. <strong>Gratis.</strong>
        </h2>
        <span>Tidak perlu kartu kredit. Pilih kelas karakter dan bangun sistem hidupmu sendiri.</span>
        <Link href="/register">Pilih Kelasmu <em aria-hidden>{"->"}</em></Link>
        <small>
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </small>
      </div>

      <style>{`
        .landing-preview {
          position: relative;
          z-index: 1;
          padding-bottom: 28px;
        }

        .loop-heading {
          max-width: 520px;
          margin-bottom: 24px;
        }

        .loop-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          color: #2dd4bf;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.34em;
          text-transform: uppercase;
        }

        .loop-eyebrow span {
          width: 20px;
          height: 1px;
          background: #2dd4bf;
          box-shadow: 0 0 14px rgba(45, 212, 191, 0.7);
        }

        .loop-heading h2 {
          margin: 0;
          color: #fff;
          font-size: 30px;
          font-weight: 900;
          line-height: 1.15;
        }

        .loop-heading p {
          margin: 8px 0 0;
          color: rgba(226, 232, 240, 0.64);
          font-size: 14px;
          line-height: 1.65;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 38px;
        }

        .step-card {
          position: relative;
          min-height: 142px;
          border: 1px solid rgba(139, 92, 246, 0.42);
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.78), rgba(3, 7, 18, 0.7));
          padding: 20px;
          box-shadow: inset 0 0 24px rgba(124, 58, 237, 0.08);
        }

        .step-card.rose {
          border-color: rgba(244, 114, 182, 0.48);
        }

        .step-card.teal {
          border-color: rgba(45, 212, 191, 0.46);
        }

        .step-card p {
          margin: 0 0 16px;
          color: #c084fc;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 900;
        }

        .step-card.rose p {
          color: #fb7185;
        }

        .step-card.teal p {
          color: #2dd4bf;
        }

        .step-main {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 14px;
          align-items: start;
        }

        .step-icon {
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          border: 1px solid rgba(168, 85, 247, 0.72);
          border-radius: 13px;
          color: #c084fc;
          background: rgba(88, 28, 135, 0.22);
          transform: rotate(45deg);
        }

        .step-card.rose .step-icon {
          border-color: rgba(244, 114, 182, 0.72);
          color: #fb7185;
          background: rgba(244, 63, 94, 0.12);
        }

        .step-card.teal .step-icon {
          border-color: rgba(45, 212, 191, 0.72);
          color: #2dd4bf;
          background: rgba(20, 184, 166, 0.12);
        }

        .step-icon svg {
          width: 22px;
          height: 22px;
          transform: rotate(-45deg);
        }

        .step-card h3 {
          margin: 0;
          color: #fff;
          font-size: 15px;
          font-weight: 900;
        }

        .step-card span {
          display: block;
          margin-top: 8px;
          color: rgba(203, 213, 225, 0.58);
          font-size: 12px;
          line-height: 1.65;
        }

        .step-card b {
          position: absolute;
          right: -17px;
          top: 50%;
          color: #8b5cf6;
          font-size: 24px;
          transform: translateY(-50%);
          text-shadow: 0 0 12px rgba(139, 92, 246, 0.8);
        }

        .final-cta {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.82);
          border-radius: 24px;
          background:
            radial-gradient(circle at 18% 52%, rgba(124, 58, 237, 0.24), transparent 22%),
            radial-gradient(circle at 82% 52%, rgba(124, 58, 237, 0.24), transparent 22%),
            linear-gradient(135deg, rgba(30, 27, 75, 0.72), rgba(3, 7, 18, 0.84));
          padding: 50px 24px;
          text-align: center;
          box-shadow:
            0 0 36px rgba(124, 58, 237, 0.28),
            inset 0 0 40px rgba(124, 58, 237, 0.12);
        }

        .final-cta::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(139, 92, 246, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.12) 1px, transparent 1px);
          background-size: 44px 44px;
          opacity: 0.24;
        }

        .cta-sigil {
          position: absolute;
          top: 50%;
          width: 58px;
          height: 58px;
          border: 1px solid #8b5cf6;
          border-radius: 16px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.42), rgba(3, 7, 18, 0.12));
          box-shadow: 0 0 26px rgba(139, 92, 246, 0.7);
          transform: translateY(-50%) rotate(45deg);
        }

        .cta-sigil.left {
          left: 20%;
        }

        .cta-sigil.right {
          right: 20%;
        }

        .final-cta p,
        .final-cta h2,
        .final-cta span,
        .final-cta a,
        .final-cta small {
          position: relative;
          z-index: 1;
        }

        .final-cta p {
          margin: 0 0 12px;
          color: #c084fc;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.34em;
          text-transform: uppercase;
        }

        .final-cta h2 {
          margin: 0;
          color: #fff;
          font-size: 34px;
          font-weight: 900;
          line-height: 1.15;
        }

        .final-cta h2 strong {
          color: #facc15;
          font: inherit;
        }

        .final-cta > span {
          display: block;
          max-width: 500px;
          margin: 12px auto 0;
          color: rgba(226, 232, 240, 0.68);
          font-size: 15px;
          line-height: 1.7;
        }

        .final-cta > a {
          display: inline-flex;
          min-width: 250px;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          margin-top: 24px;
          border: 1px solid rgba(255, 226, 122, 0.88);
          border-radius: 10px;
          background: linear-gradient(180deg, #ffe178, #d99b1d);
          box-shadow: 0 0 24px rgba(250, 204, 21, 0.34);
          color: #1d1302;
          font-size: 16px;
          font-weight: 900;
          text-decoration: none;
        }

        .final-cta em {
          margin-left: 8px;
          font-style: normal;
        }

        .final-cta small {
          display: block;
          margin-top: 14px;
          color: rgba(203, 213, 225, 0.62);
          font-size: 13px;
        }

        .final-cta small a {
          color: #c084fc;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 980px) {
          .steps-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .step-card b {
            display: none;
          }
        }

        @media (max-width: 620px) {
          .steps-grid {
            grid-template-columns: 1fr;
          }

          .cta-sigil {
            display: none;
          }

          .final-cta {
            padding: 38px 18px;
          }

          .final-cta h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </section>
  );
}
