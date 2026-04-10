"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Database } from "@/lib/supabase/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { KineticHeadline } from "@/components/ui/KineticHeadline";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

interface GameTypeInfo {
  icon: string;
  color: string;
  badge: string;
  badgeColor: string;
  emoji: string;
}

const GAME_TYPE_INFO: Record<string, GameTypeInfo> = {
  "spin-wheel": {
    icon: "casino",
    color: "#2E97E6",
    badge: "Numeracy",
    badgeColor: "text-tertiary",
    emoji: "🎡",
  },
  "match-up": {
    icon: "compare_arrows",
    color: "#00A396",
    badge: "Literacy",
    badgeColor: "text-primary",
    emoji: "🔤",
  },
  quiz: {
    icon: "quiz",
    color: "#FFB800",
    badge: "Quiz",
    badgeColor: "text-secondary",
    emoji: "❓",
  },
  flashcards: {
    icon: "style",
    color: "#FF8A80",
    badge: "Memory",
    badgeColor: "text-orange-500",
    emoji: "🃏",
  },
  "speaking-cards": {
    icon: "record_voice_over",
    color: "#E040FB",
    badge: "Speaking",
    badgeColor: "text-purple-500",
    emoji: "🎤",
  },
  "complete-sentence": {
    icon: "text_fields",
    color: "#00629E",
    badge: "Grammar",
    badgeColor: "text-primary",
    emoji: "📝",
  },
  "group-sort": {
    icon: "category",
    color: "#7C5800",
    badge: "Sorting",
    badgeColor: "text-secondary",
    emoji: "🗂️",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

interface Props {
  teacherFirstName: string;
  activities: Activity[];
  sharedActivities: Activity[];
  totalSessions: number;
  totalStudents: number;
  engagementPct: number;
  topScorer: { name: string; score: number; activity: string } | null;
}

export function DashboardClient({
  teacherFirstName,
  activities,
  sharedActivities,
  totalSessions,
  totalStudents,
  engagementPct,
  topScorer,
}: Props) {
  const featuredActivity = activities[0];
  const featuredInfo = featuredActivity
    ? (GAME_TYPE_INFO[featuredActivity.game_type] ?? GAME_TYPE_INFO.quiz)
    : null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* ===== Hero / Welcome Section ===== */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-[0_30px_60px_rgba(0,98,158,0.18)]"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-10 w-72 h-72 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-tertiary-container/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-lg">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 18 }}
            className="text-4xl md:text-5xl font-black font-headline leading-tight origin-left"
          >
            Ready for today&apos;s adventure, {teacherFirstName}?
          </motion.h2>
          <p className="text-sky-100 text-lg font-body">
            {featuredActivity
              ? `Your students are waiting for "${featuredActivity.title}".`
              : "Create your first game to get started."}
          </p>
          <div className="flex gap-3 pt-4 flex-wrap">
            {featuredActivity ? (
              <Link href={`/create/${featuredActivity.game_type}?play=${featuredActivity.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-full font-bold shadow-xl flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Quick Start Class
                </motion.button>
              </Link>
            ) : (
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-full font-bold shadow-xl flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create First Activity
                </motion.button>
              </Link>
            )}
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white/15 backdrop-blur-md text-white border border-white/30 rounded-full font-bold"
              >
                View Lesson Plans
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden shadow-2xl rotate-2 bg-white/10 flex items-center justify-center text-7xl">
          {featuredInfo?.emoji ?? "🎮"}
        </div>
      </motion.section>

      {/* ===== Bento Stats Grid ===== */}
      <motion.section
        variants={item}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Class Engagement (large) */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between ambient-shadow kinetic-float">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Class Engagement
              </p>
              <h3 className="text-5xl font-black text-primary font-headline mt-1">
                <AnimatedNumber value={engagementPct} format={(n) => `${Math.round(n)}%`} />
              </h3>
            </div>
            <span className="material-symbols-outlined text-tertiary text-4xl">
              trending_up
            </span>
          </div>
          <div className="mt-6 w-full bg-surface-container-highest h-4 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${engagementPct}%` }}
              transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
              className="shimmer-bar h-full"
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-4 font-medium">
            {totalSessions} session{totalSessions === 1 ? "" : "s"} played recently · {totalStudents} student
            {totalStudents === 1 ? "" : "s"} engaged
          </p>
        </div>

        {/* Top Scorer */}
        <div className="bg-secondary-container rounded-xl p-8 text-on-secondary-container kinetic-float ambient-shadow">
          <span className="material-symbols-outlined text-4xl mb-4 block">stars</span>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Top Scorer</p>
          <h3 className="text-2xl font-black font-headline mt-1 truncate">
            {topScorer?.name ?? "—"}
          </h3>
          <p className="text-sm mt-2 font-medium truncate">
            {topScorer ? `${topScorer.score.toLocaleString()} pts in '${topScorer.activity}'` : "Play a game to see leaders"}
          </p>
        </div>

        {/* Activities Created */}
        <div className="bg-tertiary rounded-xl p-8 text-on-tertiary kinetic-float ambient-shadow flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-4xl mb-4 block">
              extension
            </span>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Activities</p>
            <h3 className="text-3xl font-black font-headline mt-1">
              <AnimatedNumber value={activities.length} />
            </h3>
          </div>
          <p className="text-sm opacity-80">In your library</p>
        </div>
      </motion.section>

      {/* ===== My Activities Grid ===== */}
      <motion.section variants={item} className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <KineticHeadline as="h2" size="md" tone="on-surface" rotate={-1}>
              My Activities
            </KineticHeadline>
            <p className="text-on-surface-variant font-body mt-1">
              Curated games for Year 1 Literacy &amp; Numeracy
            </p>
          </div>
          <Link
            href="/create"
            className="text-primary font-bold flex items-center gap-1 hover:underline"
          >
            View All
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>

        {activities.length === 0 ? (
          <Link href="/create">
            <div className="rounded-xl p-12 text-center bg-surface-container-low ambient-shadow kinetic-float cursor-pointer">
              <div className="text-7xl mb-4">🎮</div>
              <p className="font-headline font-bold text-xl text-on-surface mb-1">
                No activities yet
              </p>
              <p className="text-on-surface-variant font-body">
                Tap to create your first game!
              </p>
            </div>
          </Link>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activities.map((activity) => {
              const info = GAME_TYPE_INFO[activity.game_type] ?? GAME_TYPE_INFO.quiz;
              return (
                <motion.div
                  key={activity.id}
                  variants={item}
                  className="group bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow kinetic-float"
                >
                  <div
                    className="h-36 relative flex items-center justify-center text-7xl"
                    style={{
                      background: `linear-gradient(135deg, ${info.color}33, ${info.color}11)`,
                    }}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-500">
                      {info.emoji}
                    </span>
                    <div
                      className={`absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase ${info.badgeColor}`}
                    >
                      {info.badge}
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <h4 className="text-lg font-bold font-headline truncate">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        Live
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <span className="material-symbols-outlined text-sm">extension</span>
                        {activity.game_type.replace("-", " ")}
                      </span>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Link
                        href={`/create/${activity.game_type}?edit=${activity.id}`}
                        className="flex-1"
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors"
                        >
                          Edit
                        </motion.button>
                      </Link>
                      <Link href={`/create/${activity.game_type}?play=${activity.id}`}>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.05 }}
                          className="p-2 px-3 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center"
                          aria-label={`Play ${activity.title}`}
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Create New Placeholder */}
            <Link href="/create">
              <motion.div
                whileHover={{ scale: 1.02, y: -8 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl flex flex-col items-center justify-center p-8 h-full min-h-[260px] text-on-surface-variant hover:text-primary transition-all cursor-pointer bg-surface-container-low/50 hover:bg-primary/5"
              >
                <span className="material-symbols-outlined text-6xl mb-4">add_circle</span>
                <p className="font-bold font-headline">Create New Activity</p>
                <p className="text-sm mt-1">Start from a template</p>
              </motion.div>
            </Link>
          </div>
        )}
      </motion.section>

      {/* ===== Shared Library ===== */}
      {sharedActivities.length > 0 && (
        <motion.section variants={item} className="space-y-6">
          <div>
            <KineticHeadline as="h2" size="md" tone="on-surface" rotate={-1}>
              Shared Library
            </KineticHeadline>
            <p className="text-on-surface-variant font-body mt-1">
              Ready-to-play activities from other teachers
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sharedActivities.map((activity) => {
              const info = GAME_TYPE_INFO[activity.game_type] ?? GAME_TYPE_INFO.quiz;
              return (
                <div
                  key={activity.id}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow kinetic-float"
                >
                  <div
                    className="h-32 relative flex items-center justify-center text-6xl"
                    style={{
                      background: `linear-gradient(135deg, ${info.color}33, ${info.color}11)`,
                    }}
                  >
                    {info.emoji}
                    <div className="absolute top-3 right-3 bg-tertiary-container/90 text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Shared
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h4 className="text-base font-bold font-headline truncate">
                      {activity.title}
                    </h4>
                    <Link href={`/create/${activity.game_type}?play=${activity.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">play_arrow</span>
                        Play
                      </motion.button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
