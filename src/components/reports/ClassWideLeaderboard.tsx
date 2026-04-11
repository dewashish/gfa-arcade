"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import type { ClassLeaderboardRow } from "@/app/(teacher)/reports/page";

/**
 * Cumulative class leaderboard across every session this teacher has
 * run. Top 10 students by total score. Visually mirrors the existing
 * LiveLeaderboard compact variant: avatar + name + medal rank + score.
 */

interface Props {
  data: ClassLeaderboardRow[];
}

const RANK_ICON = ["🥇", "🥈", "🥉"];

export function ClassWideLeaderboard({ data }: Props) {
  return (
    <section className="rounded-[28px] bg-surface-container-lowest ambient-shadow p-5 md:p-6">
      <div className="mb-4">
        <h2 className="font-headline font-black text-lg md:text-xl text-on-surface">
          Class Top 10
        </h2>
        <p className="text-xs font-body text-on-surface-variant mt-1">
          Cumulative scores across every session
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-center font-body text-on-surface-variant py-8">
          No students ranked yet.
        </p>
      ) : (
        <ol className="space-y-2">
          {data.map((row, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            const accuracy =
              row.total_answers > 0
                ? Math.round((row.correct_answers / row.total_answers) * 100)
                : 0;
            return (
              <motion.li
                key={row.student_id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-2xl ${
                  isTop3
                    ? "bg-secondary-container/20 ring-1 ring-secondary-container/50"
                    : "bg-surface-container-low"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {isTop3 ? (
                    <span className="text-2xl">{RANK_ICON[i]}</span>
                  ) : (
                    <span className="font-headline font-black text-on-surface-variant">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar + name */}
                <Avatar avatarId={row.avatar_id} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-on-surface truncate">
                    {row.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    {row.sessions_played} session
                    {row.sessions_played === 1 ? "" : "s"} · {accuracy}% accuracy
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className="font-headline font-black text-lg text-primary leading-none">
                    {row.total_score.toLocaleString()}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">
                    pts
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
