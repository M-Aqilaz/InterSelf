import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-white/0 p-6 backdrop-blur-xl shadow-[0_40px_120px_rgba(26,11,66,0.45)]",
      className
    )}
    {...props}
  />
);
