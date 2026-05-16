"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Compass, Menu, ShieldHalf, Swords, Trophy, UsersRound } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useGameAudio } from "@/hooks/use-game-audio";

const navItems = [
  { label: "Profile", href: "#character", icon: Compass },
  { label: "Arena", href: "#arena", icon: Swords },
  { label: "Challenges", href: "#challenges", icon: Trophy },
  { label: "Allies", href: "#social", icon: UsersRound },
  { label: "Sanctum", href: "#systems", icon: ShieldHalf },
];

type HeaderUser = {
  id: string;
  name: string | null;
  profile?: { username: string | null } | null;
} | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { play } = useGameAudio();
  const username = user?.profile?.username ?? user?.name ?? "Explorer";
  const isAuthenticated = Boolean(user);

  const activeSection = useMemo(() => {
    if (!pathname) return "Profile";
    const lower = pathname.toLowerCase();
    if (lower.includes("arena")) return "Arena";
    if (lower.includes("challenge")) return "Challenges";
    if (lower.includes("social")) return "Allies";
    if (lower.includes("system")) return "Sanctum";
    return "Profile";
  }, [pathname]);

  const handleNavClick = (item: (typeof navItems)[number]) => {
    void play("nav", 100);
    if (open) setOpen(false);
    if (typeof window !== "undefined") {
      const target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.history.replaceState(null, "", item.href);
        return;
      }
    }
    void router.push(item.href);
  };

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
        <nav className="relative hidden items-center gap-6 text-sm font-semibold text-white/70 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-3 py-1 transition",
                  isActive ? "text-white" : "hover:text-white"
                )}
                onClick={() => handleNavClick(item)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && <span className="absolute inset-0 -z-10 rounded-full bg-white/10" />}
              </button>
            );
          })}
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
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.label;
          return (
            <button
              key={item.label}
              className={cn(
                "flex items-center gap-2 text-left text-sm",
                isActive ? "text-white" : "text-white/70"
              )}
              onClick={() => handleNavClick(item)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        {renderActions(true)}
      </div>
    </header>
  );
}
