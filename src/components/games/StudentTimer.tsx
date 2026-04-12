"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { TimerRing } from "@/components/ui/TimerRing";
import { useSound } from "@/hooks/useSound";

interface StudentTimerProps {
  /** Total duration in seconds */
  duration: number;
  /** Whether the timer is actively counting */
  running: boolean;
  /** Called when the timer hits 0 */
  onComplete?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Student-visible countdown timer with sound effects.
 *
 * Wraps TimerRing and adds:
 * - Tick sound for last 5 seconds
 * - Urgency "countdown-low" at last 3 seconds
 * - Pulsing red ring + scale animation at last 3 seconds
 * - Subtle bounce on each tick
 */
export function StudentTimer({
  duration,
  running,
  onComplete,
  size = "md",
}: StudentTimerProps) {
  const { play } = useSound();
  const lastTickRef = useRef(duration);
  const completedRef = useRef(false);

  const ringSize = size === "sm" ? 80 : size === "md" ? 120 : 160;
  const strokeWidth = size === "sm" ? 8 : size === "md" ? 10 : 14;

  // Track remaining time internally for sound effects
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    lastTickRef.current = duration;
    completedRef.current = false;
  }, [running, duration]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const sec = Math.ceil(remaining);

      // Play tick sounds
      if (sec !== lastTickRef.current && sec <= 5 && sec > 0) {
        if (sec <= 3) {
          play("countdown-low");
        } else {
          play("tick");
        }
        lastTickRef.current = sec;
      }

      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
        clearInterval(id);
      }
    }, 100);

    return () => clearInterval(id);
  }, [running, duration, play, onComplete]);

  // Calculate urgency for visual effects
  const getRemaining = useCallback(() => {
    if (!running) return duration;
    const elapsed = (Date.now() - startRef.current) / 1000;
    return Math.max(0, duration - elapsed);
  }, [running, duration]);

  const remaining = getRemaining();
  const isUrgent = remaining <= 3 && remaining > 0 && running;

  return (
    <motion.div
      animate={
        isUrgent
          ? { scale: [1, 1.08, 1] }
          : { scale: 1 }
      }
      transition={
        isUrgent
          ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
      className="relative"
    >
      <TimerRing
        duration={duration}
        running={running}
        onComplete={onComplete}
        size={ringSize}
        strokeWidth={strokeWidth}
      />
      {/* Urgency glow ring */}
      {isUrgent && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "0 0 20px rgba(186, 26, 26, 0.4), 0 0 40px rgba(186, 26, 26, 0.2)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
