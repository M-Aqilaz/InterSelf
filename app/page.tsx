import { LandingHero } from "@/components/sections/landing-hero";
import { LandingFeatures } from "@/components/sections/landing-features";
import { LandingPreview } from "@/components/sections/landing-preview";

export default function Home() {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px 80px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      <LandingHero />
      <LandingFeatures />
      <LandingPreview />
    </div>
  );
}