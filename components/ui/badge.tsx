import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const palette = {
  cyber: "bg-[rgba(138,123,255,0.15)] text-[#8a7bff] border-[rgba(138,123,255,0.6)]",
  neon: "bg-[rgba(53,217,255,0.15)] text-[#35d9ff] border-[rgba(53,217,255,0.6)]",
  void: "bg-white/10 text-white border-white/20",
};

type BadgeVariant = keyof typeof palette;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "cyber", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        palette[variant],
        className
      )}
      {...props}
    />
  );
}
