"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/game-store";
import { Avatar } from "@/components/ui/Avatar";
import { SPRING } from "@/lib/design/motion";
import type { ActivityConfig, QuizConfig } from "@/lib/game-engine/types";

interface StudentDetailModalProps {
  open: boolean;
  sessionId: string;
  studentId: string | null;
  activityConfig: ActivityConfig | null;
  onClose: () => void;
}

interface ScoreRow {
  id: string;
  question_index: number;
  is_correct: boolean;
  score: number;
  time_taken_ms: number;
  selected_index: number | null;
  answered_at: string;
}

/**
 * Teacher-only per-student answer history modal.
 *
 * Opened by clicking any row in `<LiveLeaderboard onRowClick>` or any
 * avatar in `<AnswerStatusPanel>`. Loads every `game_scores` row for the
 * selected student and — for quizzes — resolves `selected_index` +
 * `correct_index` back to the real option text from the activity config,
 * so the teacher sees "Picked: 8 · Correct: 7" instead of just ✓/✗.
 *
 * For non-quiz game types we fall back to a generic summary (no option
 * text), keeping the modal useful everywhere.
 */
export function StudentDetailModal({
  open,
  sessionId,
  studentId,
  activityConfig,
  onClose,
}: StudentDetailModalProps) {
  const { leaderboard } = useGameStore();
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Look up the student's display info from the current leaderboard
  // snapshot — no second DB round-trip needed.
  const entry = useMemo(
    () => leaderboard.find((e) => e.student_id === studentId),
    [leaderboard, studentId]
  );
  const rank = entry ? leaderboard.findIndex((e) => e.student_id === studentId) + 1 : null;

  // Load rows whenever the modal opens for a different student.
  useEffect(() => {
    if (!open || !studentId) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("game_scores")
      .select("id, question_index, is_correct, score, time_taken_ms, selected_index, answered_at")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .order("question_index", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("[student-detail] fetch error:", error.message);
          setRows([]);
        } else {
          setRows(data ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionId, studentId]);

  // Escape + focus on open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Build the per-question view. For quizzes we enrich with option text;
  // for other types we render a generic summary row.
  const questionBreakdown = useMemo(() => {
    if (!activityConfig || activityConfig.type !== "quiz") return null;
    const quiz = activityConfig as QuizConfig;
    return quiz.questions.map((q, i) => {
      const row = rows.find((r) => r.question_index === i) ?? null;
      return { index: i, question: q, row };
    });
  }, [activityConfig, rows]);

  const totalAnswered = rows.length;
  const totalCorrect = rows.filter((r) => r.is_correct).length;

  return (
    <AnimatePresence>
      {open && studentId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${entry?.student_name ?? "Student"} details`}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={SPRING.snappy}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl max-h-[90vh] bg-surface-container-lowest rounded-[28px] shadow-[0_30px_90px_rgba(0,98,158,0.25)] pointer-events-auto flex flex-col overflow-hidden">
              {/* Header */}
              <div className="shrink-0 px-6 py-5 border-b border-outline-variant/15 flex items-center gap-4">
                {entry && <Avatar avatarId={entry.avatar_id} size="lg" />}
                <div className="flex-1 min-w-0">
                  <h2 className="font-headline font-black text-xl text-on-surface truncate">
                    {entry?.student_name ?? "Student"}
                  </h2>
                  <p className="text-xs font-body text-on-surface-variant">
                    {rank ? `Rank #${rank} · ` : ""}
                    {entry?.total_score.toLocaleString() ?? 0} pts
                    {totalAnswered > 0 && (
                      <>
                        {" · "}
                        {totalCorrect}/{totalAnswered} correct
                      </>
                    )}
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="focus-ring w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center shrink-0"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">
                    close
                  </span>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {loading && (
                  <p className="text-center text-on-surface-variant font-body py-8">
                    Loading…
                  </p>
                )}

                {!loading && questionBreakdown && (
                  <>
                    {questionBreakdown.map(({ index, question, row }) => {
                      const picked = row?.selected_index ?? null;
                      const correctIdx = question.correct_index;
                      const pickedText =
                        picked !== null && picked >= 0 && picked < question.options.length
                          ? question.options[picked]
                          : null;
                      const correctText = question.options[correctIdx];
                      return (
                        <div
                          key={index}
                          className={`rounded-2xl p-4 border ${
                            !row
                              ? "bg-surface-container-low border-outline-variant/20"
                              : row.is_correct
                                ? "bg-tertiary-container/25 border-tertiary-container/50"
                                : "bg-error-container/20 border-error-container/50"
                          }`}
                        >
                          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">
                            Question {index + 1}
                          </p>
                          <p className="font-headline font-bold text-on-surface mb-2">
                            {question.question}
                          </p>
                          {!row ? (
                            <p className="text-sm font-body text-on-surface-variant italic">
                              Still thinking…
                            </p>
                          ) : (
                            <div className="text-sm font-body space-y-1">
                              <p className="flex items-center gap-2">
                                <span
                                  className={`material-symbols-outlined text-base ${
                                    row.is_correct ? "text-tertiary" : "text-error"
                                  }`}
                                  aria-hidden="true"
                                >
                                  {row.is_correct ? "check_circle" : "cancel"}
                                </span>
                                <span className="font-bold">
                                  {row.is_correct ? "Correct" : "Incorrect"}
                                </span>
                                <span className="text-on-surface-variant">
                                  · {(row.time_taken_ms / 1000).toFixed(1)}s · {row.score} pts
                                </span>
                              </p>
                              <p className="text-on-surface">
                                <span className="text-on-surface-variant">Picked:</span>{" "}
                                <span className="font-bold">{pickedText ?? "—"}</span>
                              </p>
                              {!row.is_correct && (
                                <p className="text-on-surface">
                                  <span className="text-on-surface-variant">Correct:</span>{" "}
                                  <span className="font-bold">{correctText}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Non-quiz fallback: generic list from game_scores alone */}
                {!loading && !questionBreakdown && rows.length === 0 && (
                  <p className="text-center text-on-surface-variant font-body py-8">
                    This student hasn&apos;t answered anything yet.
                  </p>
                )}

                {!loading && !questionBreakdown && rows.length > 0 && (
                  <div className="space-y-2">
                    {rows.map((row) => (
                      <div
                        key={row.id}
                        className={`rounded-2xl p-4 border ${
                          row.is_correct
                            ? "bg-tertiary-container/25 border-tertiary-container/50"
                            : "bg-error-container/20 border-error-container/50"
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">
                          Round {row.question_index + 1}
                        </p>
                        <p className="text-sm font-body flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-base ${
                              row.is_correct ? "text-tertiary" : "text-error"
                            }`}
                            aria-hidden="true"
                          >
                            {row.is_correct ? "check_circle" : "cancel"}
                          </span>
                          <span className="font-bold">
                            {row.is_correct ? "Correct" : "Incorrect"}
                          </span>
                          <span className="text-on-surface-variant">
                            · {(row.time_taken_ms / 1000).toFixed(1)}s · {row.score} pts
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
