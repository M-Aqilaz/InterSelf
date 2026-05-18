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

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");
  const redirectTo = redirectParam?.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/dashboard";
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
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
    <Card className="border-white/10 bg-white/5 p-8">
      <div className="mb-6 space-y-3 text-center">
        <Badge variant="void" className="mx-auto w-fit">
          {mode === "login" ? "Returning Hunter" : "New Awakened"}
        </Badge>
        <h1 className="text-3xl font-black text-white">{labels.title}</h1>
        <p className="text-sm text-white/70">{labels.subtitle}</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
            placeholder="hunter@interself.gg"
          />
        </label>
        {mode === "register" && (
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required={mode === "register"}
              minLength={3}
              className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
              placeholder="shadow_breaker"
            />
          </label>
        )}
        <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={mode === "register" ? 8 : 1}
            className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
            placeholder="••••••••"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : success ? (
          <p className="text-sm text-emerald-300">{success}</p>
        ) : null}
        <Button type="submit" className="w-full rounded-full" disabled={pending}>
          {pending ? "Synchronizing..." : labels.submitLabel}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
        <span className="h-px flex-1 bg-white/10" />
        Or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <Button asChild variant="secondary" className="w-full rounded-full">
        <Link href={googleHref}>Continue with Google</Link>
      </Button>
      <p className="mt-6 text-center text-sm text-white/70">
        {labels.switchLabel}{" "}
        <Link className="text-cyan-300 hover:text-white" href={labels.switchHref}>
          {labels.switchAction}
        </Link>
      </p>
    </Card>
  );
}

function getOauthErrorMessage(error: string | null | undefined) {
  switch (error) {
    case "google_oauth_not_configured":
      return "Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.";
    case "google_oauth_denied":
      return "Google login was cancelled.";
    case "google_oauth_invalid":
      return "Google login expired. Please try again.";
    case "google_oauth_failed":
      return "Unable to complete Google login. Please try again.";
    default:
      return null;
  }
}
