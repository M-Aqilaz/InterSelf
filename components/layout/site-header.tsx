"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
      <FadeIn className="container mx-auto flex w-full items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:gap-6 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative text-xl font-black tracking-[0.2em] text-white">
            INTERSELF
          </span>
        </Link>
        {renderActions()}
        <button
          className="lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </FadeIn>
      <div className={cn("absolute left-0 right-0 top-full px-4 pt-3 lg:hidden", open ? "block" : "hidden")}> 
        <div className="mx-auto flex max-w-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/90 p-6 text-white shadow-2xl backdrop-blur-xl">
          {renderActions(true)}
        </div>
      </div>
    </header>
  );
}

