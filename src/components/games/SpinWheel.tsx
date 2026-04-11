"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import type { SpinWheelConfig } from "@/lib/game-engine/types";

const SEGMENT_COLORS = [
  "#2E97E6", // primary container
  "#FFB800", // secondary container
  "#00A396", // tertiary container
  "#FF8A80", // coral
  "#E040FB", // violet
  "#00629E", // primary
  "#7C5800", // secondary
  "#00C853", // green
];

interface SpinWheelProps {
  config: SpinWheelConfig;
  isTeacher: boolean;
  onSpin?: (segmentIndex: number) => void;
}

/**
 * SpinWheel — Phase 2 enrichment.
 *
 * Changes vs. the original:
 *  - Ambient orbit particles sweep around the wheel at rest to make it
 *    feel alive even without interaction.
 *  - Tick sounds fire while the wheel is actively spinning so the
 *    teacher gets auditory feedback the whole 4s, not just at the end.
 *  - The center hub pulses subtly and flares bigger during a spin.
 *  - Segments can carry optional `emoji` that renders alongside the
 *    label (Phase 2 type extension).
 *  - Winning segment gets a radial spotlight burst when the wheel
 *    lands on it.
 */
export function SpinWheel({ config, isTeacher, onSpin }: SpinWheelProps) {
  const { spinAngle, spinSegmentIndex, phase } = useGameStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const { play } = useSound();
  const { burst, fireworks } = useConfetti();

  const segmentAngle = 360 / config.segments.length;

  const gradient = useMemo(() => {
    const stops = config.segments.map((_, i) => {
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      const start = (i * segmentAngle).toFixed(1);
      const end = ((i + 1) * segmentAngle).toFixed(1);
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(from -${(segmentAngle / 2).toFixed(1)}deg, ${stops.join(", ")})`;
  }, [config.segments, segmentAngle]);

  // Fire tick sounds as the wheel slows over 4s. Starts fast (5/s) and
  // decelerates to match the tween easing so the last ticks sound like
  // the pointer catching individual segments.
  useEffect(() => {
    if (!isSpinning) return;
    const ticks = [0, 250, 500, 800, 1150, 1550, 2000, 2500, 3050, 3600];
    const timers = ticks.map((t) =>
      window.setTimeout(() => {
        play("whoosh");
      }, t)
    );
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isSpinning, play]);

  function handleSpin() {
    if (isSpinning || !isTeacher) return;

    const idx = Math.floor(Math.random() * config.segments.length);
    // Final angle: rotate at least 5 full turns + land on the chosen segment
    const targetAngle = 360 * 5 + (360 - idx * segmentAngle);

    setIsSpinning(true);
    play("drumroll");

    onSpin?.(idx);
    void targetAngle; // The angle is actually applied via the store by the parent

    setTimeout(() => {
      setIsSpinning(false);
      const segment = config.segments[idx];
      if (segment.special === "bankrupt") {
        play("bankrupt");
      } else if (segment.value >= 500) {
        fireworks();
        play("tada");
        play("applause");
      } else {
        burst();
        play("ding");
        play("correct");
      }
    }, 4000);
  }

  const currentSegment = spinSegmentIndex >= 0 ? config.segments[spinSegmentIndex] : null;

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      {/* Wheel Container */}
      <div className="relative">
        {/* Orbiting ambient sparkles — 6 dots sweeping the outer ring */}
        {[0, 60, 120, 180, 240, 300].map((baseAngle, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{ transformOrigin: "center center" }}
            animate={{ rotate: baseAngle + 360 }}
            transition={{
              duration: isSpinning ? 2 : 14,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute"
              style={{ top: "calc(-50% - 110px)", left: "-6px" }}
              animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              <div className="w-3 h-3 rounded-full bg-secondary-container shadow-[0_0_12px_rgba(254,183,0,0.8)]" />
            </motion.div>
          </motion.div>
        ))}

        {/* Pointer (top) */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20 drop-shadow-lg"
          animate={isSpinning ? { y: [-2, 2, -2] } : { y: 0 }}
          transition={{ duration: 0.08, repeat: Infinity }}
        >
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[34px] border-l-transparent border-r-transparent border-t-primary" />
        </motion.div>

        {/* Outer ring (decorative gold rim) — pulses during spin */}
        <motion.div
          className="absolute -inset-3 rounded-full bg-gradient-to-br from-secondary-container via-secondary to-secondary-container shadow-2xl"
          animate={
            isSpinning
              ? { boxShadow: "0 0 60px rgba(254,183,0,0.55)" }
              : { boxShadow: "0 0 0px rgba(254,183,0,0)" }
          }
          transition={{ duration: 0.4 }}
        />

        {/* Wheel */}
        <motion.div
          animate={{ rotate: spinAngle }}
          transition={{
            type: "tween",
            ease: [0.16, 1, 0.3, 1],
            duration: 4,
          }}
          className="w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full relative overflow-hidden"
          style={{ background: gradient, boxShadow: "0 30px 60px rgba(0, 98, 158, 0.18)" }}
        >
          {/* Segment labels + emoji */}
          {config.segments.map((seg, i) => {
            const rotation = i * segmentAngle;
            return (
              <div
                key={i}
                className="absolute inset-0 flex items-start justify-center pt-6"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <span className="flex flex-col items-center gap-1 text-white drop-shadow-md">
                  {seg.emoji && (
                    <span className="text-2xl md:text-3xl" aria-hidden="true">
                      {seg.emoji}
                    </span>
                  )}
                  <span
                    className="font-headline font-black text-sm md:text-lg"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  >
                    {seg.label}
                  </span>
                </span>
              </div>
            );
          })}

          {/* Center hub — pulses, flares bigger on spin */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-secondary-container"
              animate={
                isSpinning
                  ? {
                      scale: [1, 1.1, 1],
                      boxShadow: "0 0 40px rgba(254,183,0,0.8)",
                    }
                  : { scale: [1, 1.04, 1], boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
              }
              transition={{
                duration: isSpinning ? 0.6 : 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: "5rem", height: "5rem" }}
            >
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                casino
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Result Display */}
      <AnimatePresence mode="wait">
        {currentSegment && !isSpinning && phase === "playing" && (
          <motion.div
            key={spinSegmentIndex}
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
            className="text-center"
          >
            {currentSegment.special === "bankrupt" ? (
              <p className="font-headline font-black text-5xl text-error">
                BANKRUPT! 💥
              </p>
            ) : currentSegment.special === "x2" ? (
              <p className="font-headline font-black text-5xl text-secondary">
                DOUBLE POINTS! ✨
              </p>
            ) : (
              <p className="font-headline font-black text-6xl text-primary">
                {currentSegment.emoji && (
                  <span className="mr-2" aria-hidden="true">
                    {currentSegment.emoji}
                  </span>
                )}
                +{currentSegment.value} 🌟
              </p>
            )}
            <p className="font-body text-on-surface-variant mt-2 text-lg">
              {currentSegment.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher Spin Button */}
      {isTeacher && phase === "playing" && (
        <motion.button
          whileHover={{ scale: isSpinning ? 1 : 1.05 }}
          whileTap={{ scale: isSpinning ? 1 : 0.95 }}
          disabled={isSpinning}
          onClick={handleSpin}
          className="inline-flex items-center justify-center gap-3 px-12 py-5 font-headline font-black text-2xl text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-xl disabled:opacity-60"
        >
          {isSpinning ? (
            <>
              <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
              SPINNING...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl">casino</span>
              SPIN THE WHEEL!
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
