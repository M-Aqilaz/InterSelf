import { Suspense } from "react";
import { AuthCard } from "@/components/forms/auth-card";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<div className="text-white/70">Loading...</div>}>
        <AuthCard mode="register" />
      </Suspense>
    </div>
  );
}
