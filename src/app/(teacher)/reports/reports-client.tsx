"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KineticHeadline } from "@/components/ui/KineticHeadline";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatBar } from "@/components/reports/StatBar";
import { SessionRow } from "@/components/reports/SessionRow";
import { STAGGER, SPRING } from "@/lib/design/motion";
import type { ReportSession, ReportActivityStat } from "./page";

interface Props {
  sessions: ReportSession[];
  totalSessions: number;
  totalStudents: number;
  activityStats: ReportActivityStat[];
}

export function ReportsClient({ sessions, totalSessions, totalStudents, activityStats }: Props) {
  // Empty state for new teachers
  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Reports
        </KineticHeadline>
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <div className="text-7xl mb-4" aria-hidden="true">📊</div>
          <p className="font-headline font-bold text-2xl text-on-surface mb-2">
            No sessions yet
          </p>
          <p className="text-on-surface-variant font-body mb-6 max-w-md mx-auto">
            Run your first quiz to see class engagement, top students, and per-activity stats here.
          </p>
          <Link
            href="/bank"
            className="focus-ring h-12 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              backpack
            </span>
            Browse Activity Bank
          </Link>
        </div>
      </div>
    );
  }

  const maxSessions = Math.max(...activityStats.map((a) => a.sessions), 1);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: STAGGER.base } },
      }}
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Reports
        </KineticHeadline>
        <p className="text-on-surface-variant font-body mt-2 text-lg">
          What your class has been up to lately
        </p>
      </motion.div>

      {/* KPI Bento */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
            Sessions Played
          </p>
          <h3 className="text-5xl font-black text-primary font-headline mt-2">
            <AnimatedNumber value={totalSessions} />
          </h3>
        </div>
        <div className="bg-tertiary text-on-tertiary rounded-xl p-6 ambient-shadow">
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">
            Students Engaged
          </p>
          <h3 className="text-5xl font-black font-headline mt-2">
            <AnimatedNumber value={totalStudents} />
          </h3>
        </div>
        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-6 ambient-shadow">
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">
            Activities Used
          </p>
          <h3 className="text-5xl font-black font-headline mt-2">
            <AnimatedNumber value={activityStats.length} />
          </h3>
        </div>
      </motion.div>

      {/* Top Activities */}
      {activityStats.length > 0 && (
        <motion.section
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-4"
        >
          <div className="flex items-end justify-between">
            <h2 className="font-headline font-black text-2xl text-on-surface -rotate-1 origin-left">
              Most Played
            </h2>
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
              Top {Math.min(activityStats.length, 5)}
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow space-y-5">
            {activityStats.slice(0, 5).map((a) => (
              <StatBar
                key={a.title}
                label={a.title}
                value={a.sessions}
                max={maxSessions}
                caption={`session${a.sessions === 1 ? "" : "s"}`}
                color="bg-primary-container"
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Sessions */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="space-y-4"
      >
        <h2 className="font-headline font-black text-2xl text-on-surface -rotate-1 origin-left">
          Recent Sessions
        </h2>
        <ul className="space-y-3">
          {sessions.slice(0, 10).map((s, idx) => (
            <SessionRow
              key={s.id}
              index={idx}
              title={s.title}
              date={new Date(s.startedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              participants={s.participants}
              topScorer={s.topScorer}
            />
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}
