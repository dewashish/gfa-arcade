"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Avatar } from "@/components/ui/Avatar";
import { PodiumCard } from "@/components/ui/PodiumCard";
import type { LeaderboardEntry } from "@/lib/game-engine/types";

/**
 * Wraps a PodiumCard in a button if an onClick handler is provided so the
 * teacher can tap a top-3 podium slot to open the per-student detail
 * modal. Without the handler, renders a plain div so the student-side
 * reuse of the leaderboard doesn't get teacher-only interactivity.
 */
function PodiumWrapper({
  entry,
  onClick,
  children,
}: {
  entry: LeaderboardEntry;
  onClick?: (studentId: string) => void;
  children: React.ReactNode;
}) {
  if (!onClick) return <>{children}</>;
  return (
    <button
      type="button"
      onClick={() => onClick(entry.student_id)}
      aria-label={`${entry.student_name} details`}
      className="focus-ring text-left"
    >
      {children}
    </button>
  );
}

interface LiveLeaderboardProps {
  /** Show full podium UI (top 3 + list). When false, renders compact list only (sidebar mode). */
  variant?: "full" | "compact";
  /**
   * Optional row-click handler. When provided, rows render as buttons and
   * clicking one fires with the clicked student_id. Used by the teacher
   * monitor to open the per-student detail modal. If omitted, rows are
   * non-interactive (the student-side panel intentionally omits this).
   */
  onRowClick?: (studentId: string) => void;
}

export function LiveLeaderboard({ variant = "compact", onRowClick }: LiveLeaderboardProps) {
  const { leaderboard, studentId } = useGameStore();

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (variant === "full") {
    return (
      <section className="space-y-6 @container">
        <div className="flex justify-between items-end gap-3">
          <div className="min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ type: "spring", stiffness: 220 }}
              className="font-headline font-black text-2xl @md:text-4xl @lg:text-5xl text-primary origin-left"
            >
              Live Leaderboard
            </motion.h1>
            <p className="text-on-surface-variant mt-2 flex items-center gap-2 font-body text-sm @md:text-base">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary" />
              </span>
              {leaderboard.length} student{leaderboard.length === 1 ? "" : "s"} active
            </p>
          </div>
          <div className="hidden @xl:flex gap-2">
            <div className="px-4 py-2 bg-surface-container-high rounded-full font-bold text-sm">
              Real-time Sync
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant font-body">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-lg">Waiting for players to join...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium — order: 2nd, 1st, 3rd */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-2 @md:gap-4 @lg:gap-8 mb-8 @md:mb-12 items-end">
                {top3[1] ? (
                  <PodiumWrapper entry={top3[1]} onClick={onRowClick}>
                    <PodiumCard
                      entry={top3[1]}
                      rank={2}
                      highlight={top3[1].student_id === studentId}
                    />
                  </PodiumWrapper>
                ) : (
                  <div />
                )}
                {top3[0] && (
                  <PodiumWrapper entry={top3[0]} onClick={onRowClick}>
                    <PodiumCard
                      entry={top3[0]}
                      rank={1}
                      highlight={top3[0].student_id === studentId}
                    />
                  </PodiumWrapper>
                )}
                {top3[2] ? (
                  <PodiumWrapper entry={top3[2]} onClick={onRowClick}>
                    <PodiumCard
                      entry={top3[2]}
                      rank={3}
                      highlight={top3[2].student_id === studentId}
                    />
                  </PodiumWrapper>
                ) : (
                  <div />
                )}
              </div>
            )}

            {/* Ranks 4+ */}
            {rest.length > 0 && (
              <div className="space-y-3">
                <AnimatePresence>
                  {rest.map((entry, idx) => {
                    const rank = idx + 4;
                    const isMe = entry.student_id === studentId;
                    const clickable = !!onRowClick;
                    const rowContent = (
                      <>
                        <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                          <span className="font-headline font-black text-2xl text-on-surface-variant w-8 shrink-0">
                            {rank}
                          </span>
                          <Avatar avatarId={entry.avatar_id} size="md" />
                          <span className="font-bold text-base md:text-lg truncate">
                            {entry.student_name}
                            {isMe && <span className="ml-1 text-primary">(You)</span>}
                          </span>
                        </div>
                        <span className="font-headline font-black text-lg md:text-xl text-primary shrink-0 ml-4">
                          {entry.total_score.toLocaleString()}
                        </span>
                      </>
                    );
                    const rowClass = `bg-surface-container-lowest rounded-lg p-4 flex items-center justify-between ambient-shadow hover:translate-x-2 transition-transform ${
                      clickable ? "cursor-pointer w-full text-left" : ""
                    } ${isMe ? "ring-2 ring-primary/30" : ""}`;
                    return (
                      <motion.div
                        key={entry.student_id}
                        layout
                        layoutId={`row-${entry.student_id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                      >
                        {clickable ? (
                          <button
                            type="button"
                            onClick={() => onRowClick?.(entry.student_id)}
                            className={`focus-ring ${rowClass}`}
                          >
                            {rowContent}
                          </button>
                        ) : (
                          <div className={rowClass}>{rowContent}</div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </section>
    );
  }

  // ===== Compact (sidebar) variant =====
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-lg font-black text-on-surface">Live Leaderboard</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
          <span className="text-xs text-on-surface-variant font-body">Real-time</span>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant font-body text-sm">
          No scores yet — waiting for players...
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {leaderboard.map((entry, index) => {
              const isMe = entry.student_id === studentId;
              const isTop3 = index < 3;
              const rankIcons = ["🥇", "🥈", "🥉"];
              const clickable = !!onRowClick;
              const rowContent = (
                <>
                  <div className="w-8 text-center shrink-0">
                    {isTop3 ? (
                      <span className="text-xl">{rankIcons[index]}</span>
                    ) : (
                      <span className="font-headline font-black text-on-surface-variant">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <Avatar avatarId={entry.avatar_id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-body text-sm font-medium truncate ${isMe ? "text-primary font-bold" : "text-on-surface"}`}
                    >
                      {entry.student_name}
                      {isMe && " (You)"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-headline font-black text-on-surface text-sm">
                      {entry.total_score.toLocaleString()}
                    </p>
                  </div>
                </>
              );
              const rowClass = `flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                clickable ? "w-full text-left cursor-pointer hover:brightness-[1.04]" : ""
              } ${
                isMe
                  ? "bg-primary-container/15 ring-2 ring-primary/30"
                  : isTop3
                    ? "bg-secondary-container/10"
                    : "bg-surface-container-low"
              }`;
              return (
                <motion.div
                  key={entry.student_id}
                  layout
                  layoutId={`compact-${entry.student_id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                >
                  {clickable ? (
                    <button
                      type="button"
                      onClick={() => onRowClick?.(entry.student_id)}
                      className={`focus-ring ${rowClass}`}
                    >
                      {rowContent}
                    </button>
                  ) : (
                    <div className={rowClass}>{rowContent}</div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
