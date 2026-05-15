"use client";

import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends MotionProps {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}

export function FadeIn({ className, delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
