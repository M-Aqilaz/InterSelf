import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingClient } from "@/components/sections/onboarding-client";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { characterClass: true },
  });

  if (profile?.characterClass) redirect("/dashboard");

  return <OnboardingClient />;
}
