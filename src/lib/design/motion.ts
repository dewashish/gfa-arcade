/**
 * Centralized motion tokens for the Founders Arcade design system.
 *
 * Per ui-ux-pro-max guidance: every animation in the app must import from
 * here so duration, easing, and exit-faster-than-enter ratios stay consistent
 * across components. Hard-coded numbers in components are forbidden.
 *
 * Rules sourced from `ui-ux-pro-max`:
 *  - duration-timing: 150-300ms for micro-interactions, ≤400ms for complex
 *  - exit-faster-than-enter: exits run at ~65% of enter duration
 *  - motion-consistency: shared timing tokens, single rhythm
 *  - spring-physics: prefer spring/physics curves over linear
 *  - reduced-motion: respect prefers-reduced-motion
 */

export const DURATION = {
  /** 150ms — micro-interactions, hover/tap feedback */
  fast: 0.15,
  /** 220ms — default for entrance, dropdowns, toggles */
  base: 0.22,
  /** 320ms — complex transitions, modals, route changes */
  slow: 0.32,
  /** 480ms — celebration, big reveals (use sparingly) */
  hero: 0.48,
} as const;

export const EXIT_RATIO = 0.65;

/** Exit duration helper — always 65% of enter to feel responsive */
export function exitDuration(enterDuration: number) {
  return enterDuration * EXIT_RATIO;
}

/**
 * Cubic-bezier easing curves.
 * Use as `transition={{ ease: EASING.bouncy }}`
 */
export const EASING = {
  /** Bouncy spring landing — entrances */
  bouncy: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Smooth deceleration — most common entrance */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Acceleration into exit */
  in: [0.4, 0, 1, 1] as [number, number, number, number],
  /** Symmetric in-out for state changes */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
} as const;

/**
 * Framer Motion spring presets — prefer these over hard-coded type:"spring"
 */
export const SPRING = {
  /** Bouncy with personality — for cards, buttons, tap feedback */
  bouncy: { type: "spring" as const, stiffness: 280, damping: 22 },
  /** Stiffer, less overshoot — for layout shifts, leaderboard reorder */
  snappy: { type: "spring" as const, stiffness: 420, damping: 32 },
  /** Soft, no overshoot — for ambient floating shapes */
  soft: { type: "spring" as const, stiffness: 120, damping: 18 },
} as const;

/**
 * Standard transition objects ready to spread into Framer Motion props.
 */
export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASING.out },
  base: { duration: DURATION.base, ease: EASING.out },
  slow: { duration: DURATION.slow, ease: EASING.out },
  exitFast: { duration: exitDuration(DURATION.fast), ease: EASING.in },
  exitBase: { duration: exitDuration(DURATION.base), ease: EASING.in },
  exitSlow: { duration: exitDuration(DURATION.slow), ease: EASING.in },
} as const;

/**
 * Stagger children helper — 30-50ms per item per ui-ux-pro-max stagger-sequence rule.
 */
export const STAGGER = {
  fast: 0.03,
  base: 0.05,
  slow: 0.08,
} as const;
