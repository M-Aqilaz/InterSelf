import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/ui/toast";

const spaceGrotesk = Space_Grotesk({ subsets:["latin"], weight:["300","400","500","600","700"], variable:"--font-space-grotesk", display:"swap" });
const spaceMono = Space_Mono({ subsets:["latin"], weight:["400","700"], variable:"--font-space-mono", display:"swap" });

export const metadata: Metadata = {
  title: "InterSelf — Jadikan Dirimu Karakter Terkuat",
  description: "Platform gamifikasi pengembangan diri.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isDash = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  const user = currentUser ? {
    id: currentUser.id,
    name: currentUser.name ?? null,
    profile: { username: currentUser.profile?.username ?? null },
  } : null;

  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className={spaceGrotesk.className} style={{ background:"var(--bg-base)", color:"var(--t1)" }}>
        <ToastProvider>
          {!isDash && (
            <header style={{ width:"100%", position:"sticky", top:0, zIndex:50, background:"rgba(8,11,18,0.90)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 32px", maxWidth:1200, margin:"0 auto" }}>
                <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:"#d4a843", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#080b12", fontFamily:"monospace" }}>IS</div>
                  <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#eef0f5" }}>InterSelf</span>
                </Link>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {user ? (
                    <>
                      <Link href="/dashboard" style={{ padding:"6px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#8890a8", fontSize:12, textDecoration:"none" }}>Dashboard</Link>
                      <form action="/api/auth/logout" method="POST" style={{ display:"inline" }}>
                        <button type="submit" style={{ padding:"6px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#8890a8", fontSize:12, cursor:"pointer" }}>Logout</button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link href="/login" style={{ padding:"6px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#8890a8", fontSize:12, textDecoration:"none" }}>Masuk</Link>
                      <Link href="/register" style={{ padding:"6px 16px", borderRadius:10, background:"#d4a843", color:"#080b12", fontSize:12, fontWeight:700, textDecoration:"none" }}>Mulai Gratis</Link>
                    </>
                  )}
                </div>
              </div>
            </header>
          )}
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
