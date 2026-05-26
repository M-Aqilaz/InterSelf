import { Suspense } from "react";
import { AuthCard } from "@/components/forms/auth-card";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <Suspense fallback={<div className="text-white/70">Loading...</div>}>
        <AuthCard mode="login" />
      </Suspense>
    </div>
  );
}
