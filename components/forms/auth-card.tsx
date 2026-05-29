"use client";

import { useState, useTransition } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Swords, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const copy = {
  login: {
    eyebrow: "Returning Hunter",
    title: "Welcome back, Adventurer!",
    subtitle: "Sign in to resume your arc and keep the streak alive.",
    submitLabel: "Enter Command Deck",
    switchLabel: "Need an account?",
    switchHref: "/register",
    switchAction: "Join the guild",
  },
  register: {
    eyebrow: "New Awakened",
    title: "Begin your ascension!",
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
  icon: "user" | "lock";
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  rightControl?: ReactNode;
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
  const [showPassword, setShowPassword] = useState(false);
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

    if (!isLogin) {
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
          if (data.issues?.fieldErrors?.username) {
            setError("Username: " + data.issues.fieldErrors.username[0]);
          } else if (data.issues?.fieldErrors?.email) {
            setError("Email: " + data.issues.fieldErrors.email[0]);
          } else if (data.issues?.fieldErrors?.password) {
            setError("Password minimal 8 karakter");
          } else {
            setError(data.error ?? "Terjadi kesalahan");
          }
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
    <section className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#8d35ff]/75 bg-[#060a1b]/95 !px-5 !py-5 shadow-[0_0_0_1px_rgba(168,85,247,0.16),0_34px_110px_rgba(0,0,0,0.66)] sm:!px-8 sm:!py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(147,51,234,0.22),transparent_34%),radial-gradient(circle_at_0%_58%,rgba(91,33,182,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_42%)]" />

      <div className="relative mx-auto w-full max-w-[480px]">
        <header className="text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[#d17cff]">
            {labels.eyebrow}
          </p>
          <h1 className="mx-auto !mt-2 max-w-[430px] text-balance text-[27px] font-black leading-[1.1] text-white sm:text-[30px]">
            {labels.title}
          </h1>
          <p className="mx-auto !mt-2 max-w-[480px] text-[15px] leading-relaxed text-white/64">
            {labels.subtitle}
          </p>
        </header>

        <div className="!mt-4 grid h-10 grid-cols-2 rounded-2xl border border-white/10 bg-[#0a1024]/82 !p-1 shadow-inner shadow-black/45">
          <AuthTab active={isLogin} href="/login" icon="user" label="Login" />
          <AuthTab active={!isLogin} href="/register" icon="plus" label="Register" />
        </div>

        <Button
          asChild
          variant="secondary"
          className="relative !mt-3 h-10 w-full rounded-2xl border border-[#6829de] bg-[#070d22]/82 !px-12 text-[15px] font-bold text-white shadow-none hover:border-[#9b4cff] hover:bg-[#0a1028] hover:text-white"
        >
          <Link href={googleHref} className="justify-center">
            <GoogleMark />
            <span className="truncate">Continue with Google</span>
          </Link>
        </Button>

        <div className="!my-3 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.22em] text-white/43">
          <span className="h-px flex-1 bg-white/10" />
          <span>Or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form className="!space-y-2.5" onSubmit={handleSubmit}>
          <AuthField
            icon="user"
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nama@gmail.com"
            autoComplete="email"
          />

          {!isLogin && (
            <>
              <AuthField
                icon="user"
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="shadow_breaker"
                autoComplete="username"
                minLength={3}
              />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                Hanya huruf, angka, dan underscore. Contoh: refelz_my
              </p>
            </>
          )}

          <AuthField
            icon="lock"
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? 1 : 8}
            rightControl={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#a83cff] transition hover:bg-white/5 hover:text-white"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />

          {error ? (
            <p className="rounded-2xl border border-red-400/25 bg-red-500/10 !px-4 !py-3 text-sm leading-relaxed text-red-200">
              {error}
            </p>
          ) : success ? (
            <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 !px-4 !py-3 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}

          <Button
            type="submit"
            className="h-12 w-full gap-2 rounded-2xl bg-gradient-to-r from-[#5a22ff] via-[#7c35ff] to-[#bd35ff] text-base font-bold shadow-[0_0_28px_rgba(124,58,237,0.45)] transition hover:scale-[1.01]"
            disabled={pending}
          >
            <Swords className="h-5 w-5" />
            {pending ? "Synchronizing..." : labels.submitLabel}
          </Button>
        </form>

        <p className="!mt-3 text-center text-[15px] leading-relaxed text-white/55">
          {labels.switchLabel}{" "}
          <Link className="font-bold text-[#10e4df] hover:text-white" href={labels.switchHref}>
            {labels.switchAction}
          </Link>
        </p>
      </div>
    </section>
  );
}

function AuthTab({
  active,
  href,
  icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: "user" | "plus";
  label: string;
}) {
  const Icon = icon === "plus" ? UserPlus : User;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2.5 rounded-xl !px-3 text-[15px] font-bold transition",
        active
          ? "bg-gradient-to-r from-[#5521e9] to-[#7130ef] text-white shadow-[0_0_22px_rgba(124,58,237,0.43)]"
          : "text-white/58 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function AuthField({
  icon,
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  rightControl,
}: AuthFieldProps) {
  const Icon = icon === "lock" ? LockKeyhole : User;

  return (
    <label className="block min-w-0 !space-y-1.5">
      <span className="block text-sm font-bold leading-none text-white/95">{label}</span>
      <span className="flex h-[42px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1024]/76 !px-4 shadow-inner shadow-black/25 transition focus-within:border-[#9333ea]/80 focus-within:ring-2 focus-within:ring-[#9333ea]/20">
        <Icon className="h-5 w-5 shrink-0 text-[#a83cff]" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-white/45"
          placeholder={placeholder}
        />
        {rightControl}
      </span>
    </label>
  );
}

function GoogleMark() {
  return (
    <span className="absolute left-5 grid h-6 w-6 place-items-center text-xl font-black leading-none">
      <span className="bg-gradient-to-br from-[#4285f4] via-[#34a853] to-[#fbbc05] bg-clip-text text-transparent">
        G
      </span>
    </span>
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
