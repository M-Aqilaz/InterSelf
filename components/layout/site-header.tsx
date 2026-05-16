"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Gameplay", href: "#systems" },
  { label: "Challenges", href: "#challenges" },
  { label: "Community", href: "#social" },
];

type HeaderUser = {
  id: string;
  name: string | null;
  profile?: { username: string | null } | null;
} | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const username = user?.profile?.username ?? user?.name ?? "Explorer";
  const isAuthenticated = Boolean(user);

  function renderActions(isMobile: boolean = false) {
    if (isAuthenticated) {
      return (
        <div className={cn("items-center gap-3", isMobile ? "flex flex-col" : "hidden lg:flex") }>
          <span className="text-sm text-white/70">Hi, {username}</span>
          <Button variant="ghost" className={isMobile ? "w-full" : ""} asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button
            variant="secondary"
            className={isMobile ? "w-full" : ""}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.refresh();
            }}
          >
            Logout
          </Button>
        </div>
      );
    }
    return (
      <div className={cn("items-center gap-3", isMobile ? "flex flex-col" : "hidden lg:flex") }>
        <Button variant="ghost" className={isMobile ? "w-full" : "text-white/70"} asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button className={isMobile ? "w-full" : ""} asChild>
          <Link href="/register">Start Your Journey</Link>
        </Button>
      </div>
    );
  }

  return (
    <header className="relative z-30 w-full">
      <FadeIn className="container mx-auto flex items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative text-xl font-black tracking-[0.2em] text-white">
            INTERSELF
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/70 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        {renderActions()}
        <button
          className="lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </FadeIn>
      <div
        className={cn(
          "mt-3 flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/80 p-6 text-white backdrop-blur-xl lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {navItems.map((item) => (
          <a key={item.label} href={item.href} className="text-sm text-white/70">
            {item.label}
          </a>
        ))}
        {renderActions(true)}
      </div>
    </header>
  );
}
