"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  variant?: "primary" | "tertiary" | "secondary";
  shimmer?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const trackSize = { sm: "h-2", md: "h-3", lg: "h-4" };
const fillColors = {
  primary: "bg-primary-container",
  tertiary: "bg-tertiary-container",
  secondary: "bg-secondary-container",
};

export function ProgressBar({
  value,
  variant = "tertiary",
  shimmer = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`w-full rounded-full bg-surface-highest overflow-hidden ${trackSize[size]} ${className}`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`h-full rounded-full ${shimmer ? "shimmer-bar" : fillColors[variant]}`}
      />
    </div>
  );
}
