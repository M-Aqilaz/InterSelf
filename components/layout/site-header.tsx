"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type HeaderUser = {
  id: string;
  name: string | null;
  profile?: { username: string | null } | null;
} | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const username = user?.profile?.username ?? user?.name ?? "Explorer";
  const isAuth = Boolean(user);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  return (
    <header className="w-full sticky top-0 z-50">
      <div
        className="mx-auto flex w-full items-center justify-between gap-4 px-5 py-3"
        style={{
          background: "rgba(8,11,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: "var(--t1)", letterSpacing: "0.12em" }}
          >
            InterSelf
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuth ? (
            <>
              <span style={{ fontSize: "12px", color: "var(--t2)" }}>
                {username}
              </span>
              <Link
                href="/dashboard"
                className="btn-ghost"
                style={{ padding: "6px 16px", fontSize: "12px" }}
              >
                Dashboard
              </Link>
              <button
                className="btn-ghost"
                style={{ padding: "6px 16px", fontSize: "12px" }}
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.replace("/");
                  router.refresh();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost"
                style={{ padding: "6px 16px", fontSize: "12px" }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-gold"
                style={{ padding: "6px 16px", fontSize: "12px" }}
              >
                Mulai Gratis
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden"
          style={{
            color: "var(--t2)",
            fontSize: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-full"
          style={{
            background: "rgba(8,11,18,0.96)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {isAuth ? (
            <>
              <Link
                href="/dashboard"
                className="btn-ghost"
                style={{ textAlign: "center" }}
              >
                Dashboard
              </Link>
              <button
                className="btn-ghost"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.replace("/");
                  router.refresh();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost"
                style={{ textAlign: "center" }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-gold"
                style={{ textAlign: "center" }}
              >
                Mulai Gratis
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
