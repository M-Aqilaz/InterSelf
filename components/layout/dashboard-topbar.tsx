"use client";

import { Bell, Coins, Gift, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

type DashboardTopbarProps = {
  username: string;
  coins: number;
  hasChest?: boolean;
};

export function DashboardTopbar({ username, coins, hasChest = false }: DashboardTopbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080b12]/92 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-4 2xl:px-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/60">
            Command Deck
          </p>
          <h1 className="truncate text-lg font-black text-white sm:text-xl">
            Welcome back, {username}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-amber-200 sm:flex">
            <Coins className="h-4 w-4" />
            {coins.toLocaleString()}
          </div>
          {hasChest && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10 text-amber-200">
              <Gift className="h-4 w-4" />
            </div>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <UserRound className="h-4 w-4" />
          </div>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/65 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-200"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
