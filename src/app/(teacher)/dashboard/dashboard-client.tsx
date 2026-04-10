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
import { SUBJECT_IMAGES, SUBJECT_META, type SubjectKey } from "@/lib/bank/imagery";
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

interface RecentSession {
  id: string;
  title: string;
  startedAt: string;
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
}

const AVATAR_EMOJI: Record<string, string> = {
  cat: "🐱", dog: "🐶", penguin: "🐧", bunny: "🐰", bear: "🐻", owl: "🦉",
  fox: "🦊", panda: "🐼", lion: "🦁", unicorn: "🦄", dragon: "🐉",
  robot: "🤖", astronaut: "🧑‍🚀", superhero: "🦸", star: "⭐", rocket: "🚀",
};

export function DashboardClient({
  teacherFirstName,
  recentActivities,
  recentSessions,
  totalSessions,
  totalStudents,
  todaysPick,
}: Props) {
  const router = useRouter();
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  async function handleUseTemplate(activityId: string) {
    setLaunchingId(activityId);
    try {
      const supabase = createClient();
      const session = await createGameSession(supabase, activityId);
      router.push(`/session/${session.id}`);
    } catch (e) {
      console.error(e);
      setLaunchingId(null);
    }
  }

  const pickSubject = (todaysPick?.subject ?? "maths") as SubjectKey;
  const pickMeta = SUBJECT_META[pickSubject] ?? SUBJECT_META.maths;
  const pickImage = SUBJECT_IMAGES[pickSubject] ?? SUBJECT_IMAGES.maths;
  const pickGameInfo = todaysPick
    ? GAME_TYPE_LABELS[todaysPick.game_type] ?? { label: todaysPick.game_type, emoji: "🎮" }
    : null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: STAGGER.base, delayChildren: 0.05 },
        },
      }}
      className="space-y-10"
    >
      {/* ===== Hero ===== */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-white"
      >
        {/* Decorative floating shapes */}
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-6 right-8 text-5xl opacity-30"
        >
          ⭐
        </motion.div>
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-6 right-32 text-4xl opacity-25"
        >
          🚀
        </motion.div>
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-60 text-4xl opacity-25 hidden md:block"
        >
          🎈
        </motion.div>
        <div className="absolute -top-20 -right-10 w-72 h-72 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-tertiary-container/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-sky-100 text-sm uppercase tracking-widest font-bold mb-2">
            Welcome back
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={SPRING.snappy}
            className="text-4xl md:text-5xl font-black font-headline leading-tight origin-left"
          >
            Hey {teacherFirstName}! Ready for an adventure?
          </motion.h1>
          <p className="text-sky-100 text-lg font-body mt-3">
            Pick a ready-made activity from the Bank, or open one you&apos;ve built.
          </p>

          <div className="flex gap-3 pt-5 flex-wrap">
            <Link href="/bank">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-7 h-12 rounded-full bg-secondary-container text-on-secondary-container font-headline font-black shadow-xl flex items-center gap-2"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  backpack
                </span>
                Browse Activity Bank
              </motion.div>
            </Link>
            <Link href="/library">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-7 h-12 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/30 font-headline font-bold flex items-center gap-2"
              >
                My Library
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ===== Today's Pick ===== */}
      {todaysPick && (
        <motion.section
          variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-2xl text-on-surface -rotate-1 origin-left">
              Today&apos;s Pick
            </h2>
            <Link
              href="/bank"
              className="focus-ring text-primary font-bold text-sm flex items-center gap-1 hover:underline rounded px-2 py-1"
            >
              See all
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>

          <div
            className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden flex flex-col md:flex-row"
          >
            <div
              className="md:w-2/5 h-48 md:h-auto relative flex items-center justify-center"
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
                className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-xl"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-on-surface">
                {pickMeta.label}
              </div>
            </div>
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {pickGameInfo && <span aria-hidden="true">{pickGameInfo.emoji}</span>}
                <span>{pickGameInfo?.label ?? todaysPick.game_type}</span>
                <span>·</span>
                <span>{countActivityItems(todaysPick.config_json)} items</span>
              </div>
              <h3 className="font-headline font-black text-2xl text-on-surface">
                {todaysPick.title}
              </h3>
              {todaysPick.description && (
                <p className="text-on-surface-variant font-body">{todaysPick.description}</p>
              )}
              <button
                onClick={() => handleUseTemplate(todaysPick.id)}
                disabled={launchingId === todaysPick.id}
                className="focus-ring mt-auto self-start h-12 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-black inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {launchingId === todaysPick.id ? (
                  <>
                    <span
                      className="material-symbols-outlined animate-spin"
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                    Starting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      play_arrow
                    </span>
                    Use in class
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* ===== Mini KPI Chips ===== */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              play_circle
            </span>
          </div>
          <div>
            <p className="text-2xl font-headline font-black text-on-surface">
              <AnimatedNumber value={totalSessions} />
            </p>
            <p className="text-xs text-on-surface-variant font-body uppercase tracking-wider">
              Recent Sessions
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary" aria-hidden="true">
              groups
            </span>
          </div>
          <div>
            <p className="text-2xl font-headline font-black text-on-surface">
              <AnimatedNumber value={totalStudents} />
            </p>
            <p className="text-xs text-on-surface-variant font-body uppercase tracking-wider">
              Students Engaged
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow flex items-center gap-4 col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              extension
            </span>
          </div>
          <div>
            <p className="text-2xl font-headline font-black text-on-surface">
              <AnimatedNumber value={recentActivities.length} />
            </p>
            <p className="text-xs text-on-surface-variant font-body uppercase tracking-wider">
              In Your Library
            </p>
          </div>
        </div>
      </motion.section>

      {/* ===== Continue Where You Left Off ===== */}
      {recentActivities.length > 0 && (
        <motion.section
          variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-2xl text-on-surface -rotate-1 origin-left">
              Continue where you left off
            </h2>
            <Link
              href="/library"
              className="focus-ring text-primary font-bold text-sm flex items-center gap-1 hover:underline rounded px-2 py-1"
            >
              View all
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentActivities.map((activity) => {
              const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? {
                label: activity.game_type,
                emoji: "🎮",
              };
              const color = GAME_TYPE_COLOR[activity.game_type] ?? "#707882";
              return (
                <div
                  key={activity.id}
                  className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden"
                >
                  <div
                    className="h-28 flex items-center justify-center text-6xl"
                    style={{
                      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    }}
                    aria-hidden="true"
                  >
                    {gameInfo.emoji}
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-headline font-black text-base text-on-surface line-clamp-1">
                      {activity.title}
                    </h3>
                    <button
                      onClick={() => handleUseTemplate(activity.id)}
                      disabled={launchingId === activity.id}
                      className="focus-ring w-full h-11 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-sm shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        play_arrow
                      </span>
                      Start
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ===== Recent Sessions ===== */}
      {recentSessions.length > 0 && (
        <motion.section
          variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-2xl text-on-surface -rotate-1 origin-left">
              Recent Sessions
            </h2>
            <Link
              href="/reports"
              className="focus-ring text-primary font-bold text-sm flex items-center gap-1 hover:underline rounded px-2 py-1"
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
                className="bg-surface-container-lowest rounded-2xl p-4 ambient-shadow flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    history
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-on-surface truncate">{s.title}</p>
                  <p className="text-xs text-on-surface-variant font-body">
                    {new Date(s.startedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {s.participants} students
                  </p>
                </div>
                {s.topScorer && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-2xl" aria-hidden="true">
                      {AVATAR_EMOJI[s.topScorer.avatarId] ?? "⭐"}
                    </div>
                    <p className="font-headline font-black text-sm text-primary">
                      {s.topScorer.score.toLocaleString()}
                    </p>
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
