"use client";

import { motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

/**
 * KPI number with a pop-in animation.
 *
 * Renders the real formatted value immediately (so SSR and the first
 * client paint both show the correct number — no flash-to-zero), then
 * plays a scale-and-fade entrance to give it life.
 *
 * When `value` changes the `key` prop replays the animation so the new
 * number pops in fresh. The display number is always correct — no
 * count-up-from-zero phase that could be mistaken for empty data.
 *
 * History: the old implementation used `useMotionValue(0)` + a 1.2s
 * count-up animation. On a slow render or when a user quickly glanced
 * at the Dashboard, it looked like every KPI was at zero for a second,
 * which confused teachers into thinking their data was missing.
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  className = "",
}: AnimatedNumberProps) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`inline-block ${className}`}
    >
      {format(value)}
    </motion.span>
  );
}
