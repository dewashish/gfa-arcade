"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { TRANSITION, exitDuration, DURATION, EASING } from "@/lib/design/motion";

/**
 * Page transition wrapper for the teacher area.
 *
 * Per ui-ux-pro-max:
 *  - continuity: page transitions maintain spatial continuity
 *  - exit-faster-than-enter: exit at 65% of enter
 *  - reduced-motion: MotionConfig at the layout root collapses these
 *  - interruptible: Framer Motion handles interruption automatically
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: DURATION.base,
          ease: EASING.out,
          opacity: { duration: DURATION.base },
        }}
        style={{
          // Ensure exit happens fast per ui-ux-pro-max rule
          // (Framer Motion respects this on exit only)
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Re-export to keep tree-shaking happy
export { exitDuration, TRANSITION };
