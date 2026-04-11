"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { KineticHeadline } from "@/components/ui/KineticHeadline";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { SessionRow } from "@/components/reports/SessionRow";
import { EngagementTrendChart } from "@/components/reports/EngagementTrendChart";
import { ActivityPerformanceTable } from "@/components/reports/ActivityPerformanceTable";
import { ClassWideLeaderboard } from "@/components/reports/ClassWideLeaderboard";
import { EMPTY_STATE_IMAGES } from "@/lib/bank/imagery";
import { STAGGER } from "@/lib/design/motion";
import type {
  ReportSession,
  ReportActivityStat,
  TrendPoint,
  ClassLeaderboardRow,
} from "./page";

interface Props {
  sessions: ReportSession[];
  totalSessions: number;
  totalStudents: number;
  activityStats: ReportActivityStat[];
  trend: TrendPoint[];
  classLeaderboard: ClassLeaderboardRow[];
}

export function ReportsClient({
  sessions,
  totalSessions,
  totalStudents,
  activityStats,
  trend,
  classLeaderboard,
}: Props) {
  // Empty state for new teachers (kept identical to the previous behaviour)
  if (sessions.length === 0) {
    const img = EMPTY_STATE_IMAGES.reports;
    return (
      <div className="space-y-6">
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Reports
        </KineticHeadline>
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <Image
            src={img.url}
            alt={img.alt}
            width={img.width}
            height={img.height}
            className="w-48 h-48 mx-auto mb-6 object-contain drop-shadow-lg"
            priority
          />
          <p className="font-headline font-bold text-2xl text-on-surface mb-2">
            No sessions yet
          </p>
          <p className="text-on-surface-variant font-body mb-6 max-w-md mx-auto">
            Run your first quiz to see class engagement, top students, and
            per-activity stats here.
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
      {/* ============ HEADER ============ */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      >
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Reports
        </KineticHeadline>
        <p className="text-on-surface-variant font-body mt-2 text-lg">
          What your class has been up to lately
        </p>
      </motion.div>

      {/* ============ KPI BENTO ============ */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-surface-container-lowest rounded-[28px] p-6 ambient-shadow">
          <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
            Sessions Played
          </p>
          <h3 className="text-5xl font-black text-primary font-headline mt-2">
            <AnimatedNumber value={totalSessions} />
          </h3>
        </div>
        <div className="bg-tertiary text-on-tertiary rounded-[28px] p-6 ambient-shadow">
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">
            Students Engaged
          </p>
          <h3 className="text-5xl font-black font-headline mt-2">
            <AnimatedNumber value={totalStudents} />
          </h3>
        </div>
        <div className="bg-secondary-container text-on-secondary-container rounded-[28px] p-6 ambient-shadow">
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">
            Activities Used
          </p>
          <h3 className="text-5xl font-black font-headline mt-2">
            <AnimatedNumber value={activityStats.length} />
          </h3>
        </div>
      </motion.div>

      {/* ============ ENGAGEMENT TREND + CLASS LEADERBOARD ============ */}
      {/* Two-column split: chart on the left (wider), leaderboard on
          the right. Stacks on small screens. */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6"
      >
        <EngagementTrendChart data={trend} />
        <ClassWideLeaderboard data={classLeaderboard} />
      </motion.div>

      {/* ============ PER-ACTIVITY PERFORMANCE TABLE ============ */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      >
        <ActivityPerformanceTable data={activityStats} />
      </motion.div>

      {/* ============ RECENT SESSIONS ============ */}
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
              date={s.dateLabel}
              participants={s.participants}
              topScorer={s.topScorer}
            />
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}
