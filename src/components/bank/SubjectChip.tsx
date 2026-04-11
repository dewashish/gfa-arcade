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
  /** Tone color used when active */
  tone?: SubjectKey | "all";
}

const TONE_BG: Record<string, string> = {
  all: "from-on-surface to-on-surface-variant",
  maths: "from-primary to-primary-container",
  phonics: "from-secondary to-secondary-container",
  science: "from-tertiary to-tertiary-container",
  geography: "from-orange-600 to-orange-400",
  history: "from-purple-700 to-purple-400",
  pshe: "from-red-600 to-pink-400",
};

/**
 * Filter chip for the Activity Bank.
 * Per ui-ux-pro-max touch-target-size: minimum 44px tall.
 * Per nav-state-active: visually distinct active state.
 * Selected chip pulses subtly to draw the eye.
 */
export function SubjectChip({
  active,
  onClick,
  label,
  emoji,
  count,
  tone = "all",
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
        focus-ring inline-flex items-center gap-2 px-5 h-11 rounded-full font-headline font-bold text-sm transition-colors shrink-0
        ${
          active
            ? `bg-gradient-to-br ${TONE_BG[tone]} text-white shadow-lg`
            : "bg-surface-container-lowest text-on-surface ambient-shadow hover:bg-surface-container-low"
        }
      `}
    >
      <span className="text-base" aria-hidden="true">
        {emoji}
      </span>
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`
            text-[10px] font-black px-2 py-0.5 rounded-full
            ${active ? "bg-white/20" : "bg-surface-container"}
          `}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
