"use client";

import { useState, useTransition } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const copy = {
  login: {
    title: "Welcome back, Hunter",
    subtitle: "Sign in to resume your arc and keep the streak alive.",
    submitLabel: "Enter Command Deck",
    switchLabel: "Need an account?",
    switchHref: "/register",
    switchAction: "Join the guild",
  },
  register: {
    title: "Ascend to INTERSELF",
    subtitle: "Forge your avatar, sync your stats, and start collecting loot.",
    submitLabel: "Awaken Now",
    switchLabel: "Already synced?",
    switchHref: "/login",
    switchAction: "Return to login",
  },
};

interface AuthCardProps {
  mode: "login" | "register";
}

type AuthFieldProps = {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");
  const redirectTo =
    redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/dashboard";
  const googleHref = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`;
  const oauthError = getOauthErrorMessage(searchParams?.get("error"));

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [error, setError] = useState<string | null>(oauthError);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const labels = copy[mode];
  const isLogin = mode === "login";

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload: Record<string, string> = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (mode === "register") {
      payload.username = formData.username.trim();
    }

    startTransition(async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Something went wrong");
          return;
        }

        setSuccess("Synced. Redirecting...");
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        console.error("Auth request failed", err);
        setError("Unable to complete request. Please try again.");
      }
    });
  }

  return (
    <Card className="mx-auto w-full max-w-[34rem] overflow-hidden border-white/10 bg-[#10131c]/90 p-0 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
      <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
        <div className="space-y-3 text-center">
          <Badge variant="void" className="mx-auto w-fit">
            {isLogin ? "Returning Hunter" : "New Awakened"}
          </Badge>
          <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl">
            {labels.title}
          </h1>
          <p className="text-sm leading-relaxed text-white/70 sm:text-base">{labels.subtitle}</p>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-8 sm:py-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <AuthField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="hunter@interself.gg"
            autoComplete="email"
          />
          {mode === "register" && (
            <AuthField
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="shadow_breaker"
              autoComplete="username"
              minLength={3}
            />
          )}
          <AuthField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? 1 : 8}
          />
          {error ? (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-300">
              {error}
            </p>
          ) : success ? (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </p>
          ) : null}
          <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={pending}>
            {pending ? "Synchronizing..." : labels.submitLabel}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-white/35">
          <span className="h-px flex-1 bg-white/10" />
          Or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Button asChild variant="secondary" className="h-14 w-full rounded-full text-base">
          <Link href={googleHref}>Continue with Google</Link>
        </Button>

        <p className="mt-5 text-center text-sm text-white/70 sm:text-base">
          {labels.switchLabel}{" "}
          <Link className="font-semibold text-cyan-300 hover:text-white" href={labels.switchHref}>
            {labels.switchAction}
          </Link>
        </p>
      </div>
    </Card>
  );
}

function AuthField({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
}: AuthFieldProps) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="block text-xs font-bold uppercase tracking-[0.28em] text-white/60">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="block h-14 w-full min-w-0 rounded-2xl border border-white/15 bg-black/35 px-4 text-base font-medium normal-case tracking-normal text-white placeholder:text-white/35 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-300/15"
        placeholder={placeholder}
      />
    </label>
  );
}

function getOauthErrorMessage(error: string | null | undefined) {
  switch (error) {
    case "google_oauth_not_configured":
      return "Google login belum dikonfigurasi. Isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET.";
    case "google_oauth_denied":
      return "Google login dibatalkan.";
    case "google_oauth_invalid":
      return "Sesi Google login kedaluwarsa. Coba lagi dari tombol Google.";
    case "google_oauth_failed":
      return "Google login gagal. Pastikan redirect URI Google OAuth cocok dengan URL app ini.";
    default:
      return null;
  }
}
