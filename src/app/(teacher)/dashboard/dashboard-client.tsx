"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { createGameSession } from "@/lib/game-engine/session-manager";
import { KineticHeadline } from "@/components/ui/KineticHeadline";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { SUBJECT_META, getActivityImage, type SubjectKey } from "@/lib/bank/imagery";
import {
  GAME_TYPE_LABELS,
  countActivityItems,
  type BankActivity,
} from "@/lib/bank/types";
import { STAGGER, SPRING } from "@/lib/design/motion";
import type { Database } from "@/lib/supabase/types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

const GAME_TYPE_COLOR: Record<string, string> = {
  quiz: "#FFB800",
  "spin-wheel": "#2E97E6",
  "match-up": "#00A396",
  flashcards: "#FF8A80",
  "speaking-cards": "#E040FB",
  "group-sort": "#7C5800",
  "complete-sentence": "#00629E",
};

const GAME_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  quiz: { label: "Quiz", color: "text-secondary" },
  "spin-wheel": { label: "Numeracy", color: "text-tertiary" },
  "match-up": { label: "Literacy", color: "text-primary" },
  flashcards: { label: "Memory", color: "text-orange-500" },
  "speaking-cards": { label: "Speaking", color: "text-purple-500" },
  "group-sort": { label: "Sorting", color: "text-secondary" },
  "complete-sentence": { label: "Grammar", color: "text-primary" },
};

interface RecentSession {
  id: string;
  title: string;
  startedAt: string;
  // Pre-formatted by the server page to avoid hydration mismatches.
  dateLabel: string;
  participants: number;
  topScorer: { name: string; avatarId: string; score: number } | null;
}

interface Props {
  teacherFirstName: string;
  recentActivities: Activity[];
  recentSessions: RecentSession[];
  totalSessions: number;
  totalStudents: number;
  todaysPick: BankActivity | null;
  engagementPct: number;
  topScorer: { name: string; score: number; activity: string } | null;
}

const AVATAR_EMOJI: Record<string, string> = {
  cat: "🐱", dog: "🐶", penguin: "🐧", bunny: "🐰", bear: "🐻", owl: "🦉",
  fox: "🦊", panda: "🐼", lion: "🦁", falcon: "🦅", dragon: "🐉",
  robot: "🤖", astronaut: "🧑‍🚀", superhero: "🦸", star: "⭐", rocket: "🚀",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: STAGGER.base, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

export function DashboardClient({
  teacherFirstName,
  recentActivities,
  recentSessions,
  totalSessions,
  totalStudents,
  todaysPick,
  engagementPct,
  topScorer,
}: Props) {
  const router = useRouter();
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const featuredActivity = recentActivities[0];

  async function handleUseTemplate(activityId: string) {
    setLaunchingId(activityId);
    setLaunchError(null);
    try {
      const supabase = createClient();
      const session = await createGameSession(supabase, activityId);
      router.push(`/session/${session.id}`);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      const message = err?.message ?? "Couldn't start the game.";
      const code = err?.code ? ` (code: ${err.code})` : "";
      console.error("[dashboard] launch failed", e);
      setLaunchError(`${message}${code}`);
      setLaunchingId(null);
    }
  }

  const pickSubject = (todaysPick?.subject ?? "maths") as SubjectKey;
  const pickMeta = SUBJECT_META[pickSubject] ?? SUBJECT_META.maths;
  const pickImage = todaysPick
    ? getActivityImage(todaysPick)
    : SUBJECT_META[pickSubject]
      ? { url: "", alt: "", width: 400, height: 400 }
      : { url: "", alt: "", width: 400, height: 400 };
  const pickGameInfo = todaysPick
    ? GAME_TYPE_LABELS[todaysPick.game_type] ?? { label: todaysPick.game_type, emoji: "🎮" }
    : null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* ===== Hero / Welcome Section ===== */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-[0_30px_60px_rgba(0,98,158,0.18)]"
      >
        {/* Floating shapes */}
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-6 right-1/3 text-5xl opacity-30 hidden md:block"
        >
          ⭐
        </motion.div>
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-6 right-1/4 text-4xl opacity-25 hidden md:block"
        >
          🚀
        </motion.div>

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
            {todaysPick
              ? `Today's pick: "${todaysPick.title}".`
              : featuredActivity
                ? `Your students are waiting for "${featuredActivity.title}".`
                : "Browse the Activity Bank to get started."}
          </p>
          <div className="flex gap-3 pt-4 flex-wrap">
            <Link href="/bank">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-full font-bold shadow-xl flex items-center gap-2"
              >
                <span className="material-symbols-outlined" aria-hidden="true">backpack</span>
                Browse Activity Bank
              </motion.button>
            </Link>
            <Link href="/library">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white/15 backdrop-blur-md text-white border border-white/30 rounded-full font-bold"
              >
                My Library
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Featured emoji panel — restored from main */}
        <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden shadow-2xl rotate-2 bg-white/10 flex items-center justify-center text-7xl">
          {pickGameInfo?.emoji ?? featuredActivity ? "🎮" : "✨"}
        </div>
      </motion.section>

      {/* ===== Bento Stats Grid — restored from main ===== */}
      <motion.section
        variants={item}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Class Engagement (large 2-col) */}
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
            <span className="material-symbols-outlined text-tertiary text-4xl" aria-hidden="true">
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
          <span className="material-symbols-outlined text-4xl mb-4 block" aria-hidden="true">stars</span>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Top Scorer</p>
          <h3 className="text-2xl font-black font-headline mt-1 truncate">
            {topScorer?.name ?? "—"}
          </h3>
          <p className="text-sm mt-2 font-medium truncate">
            {topScorer
              ? `${topScorer.score.toLocaleString()} pts in '${topScorer.activity}'`
              : "Play a game to see leaders"}
          </p>
        </div>

        {/* Activities Created */}
        <div className="bg-tertiary rounded-xl p-8 text-on-tertiary kinetic-float ambient-shadow flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-4xl mb-4 block" aria-hidden="true">
              extension
            </span>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Activities</p>
            <h3 className="text-3xl font-black font-headline mt-1">
              <AnimatedNumber value={recentActivities.length} />
            </h3>
          </div>
          <p className="text-sm opacity-80">In your library</p>
        </div>
      </motion.section>

      {/* ===== Today's Pick (now BELOW the bento) ===== */}
      {todaysPick && (
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <KineticHeadline as="h2" size="md" tone="on-surface" rotate={-1}>
                Today&apos;s Pick
              </KineticHeadline>
              <p className="text-on-surface-variant font-body mt-1">
                Hand-picked from the Activity Bank
              </p>
            </div>
            <Link
              href="/bank"
              className="focus-ring text-primary font-bold flex items-center gap-1 hover:underline rounded px-2 py-1"
            >
              See all
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden flex flex-col md:flex-row kinetic-float">
            <div
              className="md:w-2/5 h-56 md:h-auto relative flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${pickMeta.gradient[0]}, ${pickMeta.gradient[1]})`,
              }}
            >
              <Image
                src={pickImage.url}
                alt={pickImage.alt}
                width={pickImage.width}
                height={pickImage.height}
                priority
                className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-xl"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-on-surface">
                {pickMeta.label}
              </div>
            </div>
            <div className="flex-1 p-6 md:p-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {pickGameInfo && <span aria-hidden="true">{pickGameInfo.emoji}</span>}
                <span>{pickGameInfo?.label ?? todaysPick.game_type}</span>
                <span>·</span>
                <span>{countActivityItems(todaysPick.config_json)} items</span>
                {todaysPick.year_level && (
                  <>
                    <span>·</span>
                    <span>{todaysPick.year_level}</span>
                  </>
                )}
              </div>
              <h3 className="font-headline font-black text-3xl text-on-surface">
                {todaysPick.title}
              </h3>
              {todaysPick.description && (
                <p className="text-on-surface-variant font-body text-lg">{todaysPick.description}</p>
              )}
              <button
                onClick={() => handleUseTemplate(todaysPick.id)}
                disabled={launchingId === todaysPick.id}
                className="focus-ring mt-auto self-start h-12 px-7 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-black inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {launchingId === todaysPick.id ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" aria-hidden="true">
                      progress_activity
                    </span>
                    Starting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                    Use in class
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Launch error toast */}
      {launchError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="bg-error-container text-on-error-container rounded-xl p-4 flex items-start gap-3"
        >
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          <p className="flex-1 text-sm font-body">{launchError}</p>
          <button
            onClick={() => setLaunchError(null)}
            aria-label="Dismiss"
            className="focus-ring rounded-full p-1 hover:bg-white/20"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </motion.div>
      )}

      {/* ===== My Activities Grid — restored from main ===== */}
      {recentActivities.length > 0 && (
        <motion.section variants={item} className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <KineticHeadline as="h2" size="md" tone="on-surface" rotate={-1}>
                My Activities
              </KineticHeadline>
              <p className="text-on-surface-variant font-body mt-1">
                Continue where you left off
              </p>
            </div>
            <Link
              href="/library"
              className="focus-ring text-primary font-bold flex items-center gap-1 hover:underline rounded px-2 py-1"
            >
              View All
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentActivities.map((activity) => {
              const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? {
                label: activity.game_type,
                emoji: "🎮",
              };
              const color = GAME_TYPE_COLOR[activity.game_type] ?? "#707882";
              const badge = GAME_TYPE_BADGE[activity.game_type] ?? { label: gameInfo.label, color: "text-primary" };
              const isLaunching = launchingId === activity.id;

              return (
                <motion.div
                  key={activity.id}
                  variants={item}
                  className="group bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow kinetic-float"
                >
                  <div
                    className="h-36 relative flex items-center justify-center text-7xl"
                    style={{
                      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    }}
                    aria-hidden="true"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-500">
                      {gameInfo.emoji}
                    </span>
                    <div
                      className={`absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase ${badge.color}`}
                    >
                      {badge.label}
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <h4 className="text-lg font-bold font-headline truncate">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">groups</span>
                        Live
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">extension</span>
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
                          className="focus-ring w-full h-11 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors"
                        >
                          Edit
                        </motion.button>
                      </Link>
                      <button
                        onClick={() => handleUseTemplate(activity.id)}
                        disabled={isLaunching}
                        aria-label={`Use ${activity.title} in class`}
                        className="focus-ring h-11 px-4 rounded-lg bg-secondary-container text-on-secondary-container font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isLaunching ? (
                          <span className="material-symbols-outlined animate-spin" aria-hidden="true">
                            progress_activity
                          </span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined" aria-hidden="true">
                              play_arrow
                            </span>
                            Play
                          </>
                        )}
                      </button>
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
                <span className="material-symbols-outlined text-6xl mb-4" aria-hidden="true">
                  add_circle
                </span>
                <p className="font-bold font-headline">Create New Activity</p>
                <p className="text-sm mt-1">Start from a template</p>
              </motion.div>
            </Link>
          </div>
        </motion.section>
      )}

      {/* ===== Recent Sessions ===== */}
      {recentSessions.length > 0 && (
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <KineticHeadline as="h2" size="md" tone="on-surface" rotate={-1}>
                Recent Sessions
              </KineticHeadline>
              <p className="text-on-surface-variant font-body mt-1">
                Your most recent live classes
              </p>
            </div>
            <Link
              href="/reports"
              className="focus-ring text-primary font-bold flex items-center gap-1 hover:underline rounded px-2 py-1"
            >
              Full reports
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
          <ul className="space-y-3">
            {recentSessions.map((s) => (
              <li
                key={s.id}
                className="bg-surface-container-lowest rounded-2xl p-5 ambient-shadow flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">
                    history
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-on-surface truncate text-lg">
                    {s.title}
                  </p>
                  <p className="text-sm text-on-surface-variant font-body">
                    {s.dateLabel} · {s.participants} students
                  </p>
                </div>
                {s.topScorer && (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-3xl" aria-hidden="true">
                      {AVATAR_EMOJI[s.topScorer.avatarId] ?? "⭐"}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                        Top
                      </p>
                      <p className="font-headline font-black text-lg text-primary">
                        {s.topScorer.score.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </motion.div>
  );
}
