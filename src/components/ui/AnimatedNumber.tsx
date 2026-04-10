"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/**
 * Smoothly counts up from 0 to `value` on mount and on value changes.
 * Used for KPI cards on the Teacher Dashboard.
 */
export function AnimatedNumber({
  value,
  duration = 1.2,
  format = (n) => Math.round(n).toLocaleString(),
  className = "",
}: AnimatedNumberProps) {
  const count = useMotionValue(0);
  const display = useTransform(count, format);

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.34, 1.56, 0.64, 1],
    });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span className={className}>{display}</motion.span>;
}
