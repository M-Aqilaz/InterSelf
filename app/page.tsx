import { LandingHero } from "@/components/sections/landing-hero";
import { LandingFeatures } from "@/components/sections/landing-features";
import { LandingPreview } from "@/components/sections/landing-preview";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-16 pb-20">
      <LandingHero />
      <LandingFeatures />
      <LandingPreview />
    </div>
  );
}
