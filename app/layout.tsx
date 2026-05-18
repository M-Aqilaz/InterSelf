import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "INTERSELF — Level Up Your Real Life",
  description:
    "A Solo Leveling inspired productivity RPG with quests, bosses, achievements, and social play.",
  metadataBase: new URL("https://interself.local"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const headerUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name ?? null,
        profile: {
          username: currentUser.profile?.username ?? null,
        },
      }
    : null;
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#030014] text-white">
        <div className="gradient-grid pointer-events-none" aria-hidden />
        <ToastProvider>
          <main className="relative z-10 flex min-h-screen flex-col">
            <div className="container mx-auto flex w-full max-w-full flex-1 flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:py-10">
              <SiteHeader user={headerUser} />
              {children}
            </div>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
