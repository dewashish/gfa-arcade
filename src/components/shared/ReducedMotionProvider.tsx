"use client";

import { MotionConfig } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wrap teacher and student layouts with this so all Framer Motion
 * components automatically reduce or disable animations when the
 * user has `prefers-reduced-motion: reduce` set at the OS level.
 *
 * Sourced from ui-ux-pro-max rule `reduced-motion`:
 * "Respect prefers-reduced-motion; reduce/disable animations when requested."
 */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion={prefersReduced ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
