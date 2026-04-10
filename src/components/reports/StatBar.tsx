"use client";

import { motion } from "framer-motion";
import { TRANSITION } from "@/lib/design/motion";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  /** Optional secondary text shown to the right of the value */
  caption?: string;
  /** Tailwind color class, e.g. "bg-primary" */
  color?: string;
}

/**
 * Simple SVG-free horizontal bar chart row.
 * Per ui-ux-pro-max chart rules:
 *  - chart-type: bars suit comparison
 *  - axis-labels: label visible inline
 *  - aria-label: summarises the data point for screen readers
 *  - color-not-only: numeric value always visible alongside the bar
 */
export function StatBar({ label, value, max, caption, color = "bg-primary-container" }: StatBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div
      className="space-y-2"
      role="group"
      aria-label={`${label}: ${value}${caption ? `, ${caption}` : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-body font-bold text-sm text-on-surface truncate">{label}</span>
        <span className="font-headline font-black text-base text-on-surface shrink-0">
          {value.toLocaleString()}
          {caption && <span className="text-xs text-on-surface-variant ml-1 font-body">{caption}</span>}
        </span>
      </div>
      <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={TRANSITION.slow}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
