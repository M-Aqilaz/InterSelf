import { LandingHero } from "@/components/sections/landing-hero";
import { LandingFeatures } from "@/components/sections/landing-features";
import { LandingPreview } from "@/components/sections/landing-preview";

export default function Home() {
  return (
    <main className="interself-landing">
      <div className="landing-shell">
        <LandingHero />
        <LandingFeatures />
        <LandingPreview />
      </div>

      <style>{`
        .interself-landing {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 56% 5%, rgba(124, 58, 237, 0.22), transparent 34%),
            radial-gradient(circle at 9% 26%, rgba(20, 184, 166, 0.11), transparent 28%),
            linear-gradient(180deg, #02040d 0%, #060716 48%, #02030a 100%);
          color: #f8fafc;
        }

        .landing-shell {
          position: relative;
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
          padding: 30px 0 56px;
        }

        .landing-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(139, 92, 246, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.07) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at 50% 22%, black, transparent 68%);
          opacity: 0.55;
        }

        @media (max-width: 640px) {
          .landing-shell {
            width: min(100% - 28px, 1180px);
            padding-top: 20px;
          }
        }
      `}</style>
    </main>
  );
}
