"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
 * as time runs out. Uses a start-time ref to avoid re-render jitter.
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
  const isControlled = typeof remainingOverride === "number";
  const [displaySeconds, setDisplaySeconds] = useState(duration);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when duration changes or running starts
  useEffect(() => {
    if (isControlled) return;
    if (running) {
      startTimeRef.current = Date.now();
      completedRef.current = false;
      setDisplaySeconds(duration);
    }
  }, [duration, running, isControlled]);

  // Tick loop — uses requestAnimationFrame-like interval for smooth updates
  useEffect(() => {
    if (isControlled || !running) return;

    const id = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setDisplaySeconds(remaining);
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
        clearInterval(id);
      }
    }, 100);

    return () => clearInterval(id);
  }, [duration, running, isControlled]);

  const value = isControlled ? remainingOverride! : displaySeconds;
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
