"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TimerRingProps {
  /** Total duration in seconds */
  duration: number;
  /** Whether the timer is actively counting */
  running?: boolean;
  /** Called when the timer hits 0 */
  onComplete?: () => void;
  /** Optional remaining override for controlled mode */
  remainingOverride?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Circular countdown ring with color transition (tertiary -> secondary -> error)
 * as time runs out. Used in quiz/game timers.
 */
export function TimerRing({
  duration,
  running = true,
  onComplete,
  remainingOverride,
  size = 120,
  strokeWidth = 10,
  className = "",
}: TimerRingProps) {
  const [remaining, setRemaining] = useState(duration);
  const isControlled = typeof remainingOverride === "number";
  const value = isControlled ? remainingOverride! : remaining;

  useEffect(() => {
    if (isControlled || !running) return;
    setRemaining(duration);
  }, [duration, running, isControlled]);

  useEffect(() => {
    if (isControlled || !running) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.max(0, duration - elapsed);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onComplete?.();
      }
    }, 100);
    return () => clearInterval(id);
  }, [duration, running, isControlled, onComplete]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(1, value / duration));
  const offset = circumference * (1 - progress);

  // Color transition: tertiary (>50%) -> secondary (>20%) -> error (<20%)
  const stroke =
    progress > 0.5
      ? "var(--tertiary-container)"
      : progress > 0.2
        ? "var(--secondary-container)"
        : "var(--error)";

  const seconds = Math.ceil(value);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-container-highest)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset, stroke }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <span className="absolute font-headline font-black text-on-surface" style={{ fontSize: size * 0.32 }}>
        {seconds}
      </span>
    </div>
  );
}
