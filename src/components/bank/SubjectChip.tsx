"use client";

import { motion } from "framer-motion";
import { SPRING } from "@/lib/design/motion";
import type { SubjectKey } from "@/lib/bank/imagery";

interface SubjectChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
  count?: number;
  /** Legacy tone prop — kept so existing callers don't break, but the
   *  chip now always uses tertiary (teal) for its active state to match
   *  the Stitch design system for the Activity Bank. */
  tone?: SubjectKey | "all";
}

/**
 * Filter chip for the Activity Bank.
 *
 * Matches the Stitch "Activity Bank Catalog" mockup: white pill with
 * ambient shadow at rest, solid tertiary-teal with matching glow when
 * active. The whole row is centered in the parent and each chip pulses
 * gently to draw the eye to the current selection.
 *
 * Per ui-ux-pro-max touch-target-size: min 44px tall.
 */
export function SubjectChip({
  active,
  onClick,
  label,
  emoji,
  count,
}: SubjectChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: active ? 1 : 1.03 }}
      animate={
        active
          ? { scale: [1, 1.04, 1], transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }
          : { scale: 1 }
      }
      transition={SPRING.snappy}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Filter by ${label}${count !== undefined ? `, ${count} activities` : ""}`}
      className={`
        focus-ring inline-flex items-center gap-2 px-6 h-12 rounded-full font-headline font-bold text-sm transition-colors shrink-0
        ${
          active
            ? "bg-tertiary text-on-tertiary shadow-lg shadow-tertiary/25"
            : "bg-surface-container-lowest text-on-surface ambient-shadow hover:bg-surface-container-low"
        }
      `}
    >
      <span>{label}</span>
      <span className="text-base" aria-hidden="true">
        {emoji}
      </span>
      {count !== undefined && (
        <span
          className={`
            text-[10px] font-black px-2 py-0.5 rounded-full
            ${active ? "bg-white/25" : "bg-surface-container"}
          `}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
