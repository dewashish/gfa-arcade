"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";
import { LiveLeaderboard } from "@/components/shared/LiveLeaderboard";
import { SPRING } from "@/lib/design/motion";

/**
 * Student-side collapsible leaderboard.
 *
 * Renders a small 🏆 FAB (bottom-right) that shows the student's current
 * rank as a pill even when closed. Tapping it slides a right-side panel in
 * with a `<LiveLeaderboard variant="compact">` so the student can see
 * where they stand. The data comes from the same Zustand store the teacher
 * monitor reads, populated by the existing realtime subscription in
 * `game-play-client.tsx`, so there's no extra network wiring.
 *
 * Designed for Year 1 tablet use: 56px tap target, sheet covers ~75% of
 * the viewport on phones and caps at 400px on larger screens so it never
 * steals the whole screen.
 */
export function StudentLeaderboardPanel() {
  const [open, setOpen] = useState(false);
  const { leaderboard, studentId } = useGameStore();
  const { play } = useSound();

  // Current rank of this student. Zero-indexed in the array, so add 1.
  const myRank = studentId
    ? leaderboard.findIndex((e) => e.student_id === studentId) + 1
    : 0;

  // Close on Escape when the panel is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        play("click");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, play]);

  return (
    <>
      {/* FAB — always visible while the game is playing */}
      <motion.button
        type="button"
        onClick={() => {
          setOpen(true);
          play("pop");
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING.snappy}
        aria-label="Open leaderboard"
        className="focus-ring fixed bottom-6 right-6 z-30 h-14 min-w-[56px] px-4 rounded-full bg-gradient-to-br from-secondary to-secondary-container text-on-secondary-container shadow-[0_8px_24px_rgba(254,183,0,0.4)] flex items-center gap-2 font-headline font-black"
      >
        <span className="text-2xl" aria-hidden="true">
          🏆
        </span>
        {myRank > 0 && (
          <span className="text-base tracking-tight">#{myRank}</span>
        )}
      </motion.button>

      {/* Slide-over panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setOpen(false);
                play("click");
              }}
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Live leaderboard"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING.snappy}
              className="fixed top-0 right-0 bottom-0 w-[75%] max-w-[400px] z-50 bg-surface shadow-[-20px_0_60px_rgba(0,98,158,0.15)] flex flex-col"
            >
              {/* Close bar */}
              <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-lowest">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    🏆
                  </span>
                  <h2 className="font-headline font-black text-lg text-on-surface">
                    Leaderboard
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    play("click");
                  }}
                  aria-label="Close leaderboard"
                  className="focus-ring w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
                >
                  <span
                    className="material-symbols-outlined text-on-surface-variant"
                    aria-hidden="true"
                  >
                    close
                  </span>
                </button>
              </div>

              {/* Leaderboard list */}
              <div className="flex-1 overflow-y-auto p-4">
                <LiveLeaderboard variant="compact" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
