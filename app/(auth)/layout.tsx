import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#020613] px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(124,58,237,0.17),transparent_30%),radial-gradient(circle_at_62%_60%,rgba(79,70,229,0.24),transparent_38%),radial-gradient(circle_at_20%_88%,rgba(14,165,233,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.035),transparent_28%,rgba(124,58,237,0.06)_54%,transparent_74%)]" />
      <div className="relative w-full max-w-[760px]">{children}</div>
    </main>
  );
}
