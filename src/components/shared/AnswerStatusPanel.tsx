"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Avatar } from "@/components/ui/Avatar";
import { SPRING } from "@/lib/design/motion";

interface AnswerStatusPanelProps {
  /**
   * Fired when the teacher clicks a student avatar / name in either of the
   * two sections. Used by the monitor to open the per-student detail
   * modal (feature 3).
   */
  onStudentClick?: (studentId: string) => void;
}

/**
 * Teacher-side "who has answered the current question" split.
 *
 * Renders two rows while the game is playing:
 *   1. Still thinking (emphasized) — students yet to answer. Empty list →
 *      calm "All in!" success pill so the teacher knows to advance.
 *   2. Answered — horizontal strip of avatars, subdued styling.
 *
 * Data comes from the Zustand store: `leaderboard` is the full list of
 * joined students (one entry per participant) and `answeredStudentIds` is
 * refreshed by the monitor's 1.5 s polling loop against game_scores for
 * the current question index.
 *
 * Both sections' avatars are clickable; the click opens the shared
 * student detail modal.
 */
export function AnswerStatusPanel({ onStudentClick }: AnswerStatusPanelProps) {
  const { leaderboard, answeredStudentIds } = useGameStore();
  const answeredSet = new Set(answeredStudentIds);

  const stillThinking = leaderboard.filter((e) => !answeredSet.has(e.student_id));
  const answered = leaderboard.filter((e) => answeredSet.has(e.student_id));
  const total = leaderboard.length;

  // No one's joined yet — render nothing so we don't push the quiz card
  // around.
  if (total === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING.snappy}
      aria-label="Answer status"
      className="space-y-3"
    >
      {/* ===== Still thinking ===== */}
      <div
        className={`rounded-2xl p-4 md:p-5 transition-colors ${
          stillThinking.length === 0
            ? "bg-tertiary-container/50 ring-1 ring-tertiary-container"
            : "bg-error-container/20 ring-1 ring-error-container/60"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest font-headline font-black text-on-surface">
            {stillThinking.length === 0 ? "All in!" : "Still thinking"}
          </p>
          <span className="text-xs font-bold text-on-surface-variant">
            {answered.length} / {total} answered
          </span>
        </div>

        {stillThinking.length === 0 ? (
          <p className="text-sm font-body text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">check_circle</span>
            Everyone answered — ready to move on.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence>
              {stillThinking.map((entry) => (
                <motion.li
                  key={entry.student_id}
                  layout
                  layoutId={`thinking-${entry.student_id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={SPRING.snappy}
                >
                  <button
                    type="button"
                    onClick={() => onStudentClick?.(entry.student_id)}
                    className="focus-ring flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/90 ring-1 ring-error-container shadow-sm hover:scale-105 transition-transform"
                  >
                    <Avatar avatarId={entry.avatar_id} size="sm" />
                    <span className="font-body font-bold text-xs text-on-surface max-w-[110px] truncate">
                      {entry.student_name}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* ===== Answered ===== */}
      {answered.length > 0 && (
        <div className="rounded-2xl p-3 md:p-4 bg-surface-container-low">
          <p className="text-[10px] uppercase tracking-widest font-headline font-black text-on-surface-variant mb-2">
            Answered
          </p>
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence>
              {answered.map((entry) => (
                <motion.li
                  key={entry.student_id}
                  layout
                  layoutId={`answered-${entry.student_id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={SPRING.snappy}
                >
                  <button
                    type="button"
                    onClick={() => onStudentClick?.(entry.student_id)}
                    aria-label={`${entry.student_name} answered`}
                    className="focus-ring flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full hover:bg-surface-container transition-colors"
                  >
                    <Avatar avatarId={entry.avatar_id} size="sm" />
                    <span className="font-body text-[11px] text-on-surface-variant max-w-[90px] truncate">
                      {entry.student_name}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </motion.section>
  );
}
