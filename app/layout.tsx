import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

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
  description: "Platform gamifikasi pengembangan diri.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/brand/interself-app-icon.png",
    apple: "/brand/interself-app-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body
        className={spaceGrotesk.className}
        style={{ background: "var(--bg-base)", color: "var(--t1)" }}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
