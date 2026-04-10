"use client";

import { useEffect, useRef } from "react";
import { useConfetti } from "@/hooks/useConfetti";

interface ConfettiAnchorProps {
  trigger?: boolean;
  variant?: "burst" | "rain" | "fireworks";
  className?: string;
}

/**
 * Transparent positioned anchor that fires canvas-confetti
 * relative to its location. Mount inside a relative parent
 * for top-of-card "celebration" moments.
 */
export function ConfettiAnchor({
  trigger = false,
  variant = "burst",
  className = "",
}: ConfettiAnchorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { burst, rain, fireworks } = useConfetti();
  const lastTrigger = useRef<boolean>(false);

  useEffect(() => {
    if (trigger && !lastTrigger.current) {
      if (variant === "burst") burst();
      else if (variant === "rain") rain();
      else fireworks();
    }
    lastTrigger.current = trigger;
  }, [trigger, variant, burst, rain, fireworks]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 w-px h-px ${className}`}
    />
  );
}
