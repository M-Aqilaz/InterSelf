"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Gameplay", href: "#systems" },
  { label: "Challenges", href: "#challenges" },
  { label: "Community", href: "#social" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" className="text-white/70">
            Login
          </Button>
          <Button>Start Your Journey</Button>
        </div>
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
        <div className="flex flex-col gap-3">
          <Button variant="ghost" className="w-full">
            Login
          </Button>
          <Button className="w-full">Start Your Journey</Button>
        </div>
      </div>
    </header>
  );
}
