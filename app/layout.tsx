import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/auth";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterSelf — Jadikan Dirimu Karakter Terkuat",
  description:
    "Platform gamifikasi pengembangan diri. Setiap kebiasaan yang kamu bangun menyerang boss. Setiap hari yang kamu lewati memperkuatnya.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
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
    <html lang="id" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className={`min-h-screen ${spaceGrotesk.className}`}>
        <ToastProvider>
          <main className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader user={headerUser} />
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}