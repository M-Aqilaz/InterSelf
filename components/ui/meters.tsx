import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BarMeterProps {
  value: number;
  label: string;
  className?: string;
}

export function BarMeter({ value, label, className }: BarMeterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#8a7bff] via-[#35d9ff] to-[#ff8ee0]"
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
