"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StudentLeaderboardPanel } from "@/components/shared/StudentLeaderboardPanel";
import { AVATARS } from "@/lib/game-engine/types";
import { Certificate } from "@/components/shared/Certificate";
import {
  downloadCertificateAsPng,
  downloadCertificateAsPdf,
} from "@/lib/certificate-download";
import { useConfetti } from "@/hooks/useConfetti";
import { useSound } from "@/hooks/useSound";

interface StreakToast {
  id: number;
  name: string;
  streak: number;
}

interface GameShellProps {
  children: React.ReactNode;
  title?: string;
  pinCode?: string;
  onMuteToggle?: () => void;
  muted?: boolean;
  streakToasts?: StreakToast[];
  onDismissStreak?: (id: number) => void;
}

function streakEmoji(n: number) {
  if (n >= 10) return "🌟";
  if (n >= 8) return "⚡";
  if (n >= 5) return "🔥🔥";
  return "🔥";
}

export function GameShell({ children, title, pinCode, onMuteToggle, muted, streakToasts = [], onDismissStreak }: GameShellProps) {
  const {
    studentName,
    avatarId,
    myScore,
    myStreak,
    phase,
    studentId,
    leaderboard,
    activityTitle,
  } = useGameStore();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloadBusy, setDownloadBusy] = useState<"png" | "pdf" | null>(null);
  const { fireworks } = useConfetti();
  const { play } = useSound();

  // Fire celebration confetti + sound once when the game enters the
  // finished phase so the student sees a proper sendoff rather than just
  // a static score.
  useEffect(() => {
    if (phase !== "finished") return;
    fireworks();
    play("tada");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Compute this student's rank and total for the certificate variant.
  const myRankIndex = studentId
    ? leaderboard.findIndex((e) => e.student_id === studentId)
    : -1;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  // "Real" rank only for top 3 — everyone else gets the "great effort"
  // certificate variant regardless of where they landed.
  const certificateRank = myRank !== null && myRank <= 3 ? myRank : null;
  const totalStudents = leaderboard.length;

  async function handleDownload(format: "png" | "pdf") {
    if (!certificateRef.current || downloadBusy) return;
    setDownloadBusy(format);
    try {
      const safeName = (studentName || "certificate")
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase();
      const filename = `${safeName}-certificate`;
      if (format === "png") {
        await downloadCertificateAsPng(certificateRef.current, filename);
      } else {
        await downloadCertificateAsPdf(certificateRef.current, filename);
      }
    } catch (err) {
      console.error("[certificate] download failed", err);
    } finally {
      setDownloadBusy(null);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(0, 98, 158, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(254, 183, 0, 0.06) 0%, transparent 50%)",
      }}
    >
      {/* Top Bar — sticky glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,98,158,0.08)]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: Player */}
          <div className="flex items-center gap-3 min-w-0">
            {avatarId && <Avatar avatarId={avatarId} size="md" />}
            <div className="min-w-0">
              {studentName && (
                <p className="font-headline font-bold text-on-surface truncate text-sm md:text-base">
                  {studentName}
                </p>
              )}
              {title && (
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                  {title}
                </p>
              )}
            </div>
          </div>

          {/* Right: Score / Streak / Mute */}
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div
              key={Math.floor(myScore / 100)}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.4 }}
              className="px-3 md:px-4 py-1.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <AnimatedNumber value={myScore} className="font-headline font-black text-sm md:text-base" />
            </motion.div>

            <AnimatePresence>
              {myStreak > 1 && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container flex items-center gap-1 shadow-md"
                >
                  <span className="text-base">🔥</span>
                  <span className="font-headline font-black text-sm">x{myStreak}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {onMuteToggle && (
              <button
                onClick={onMuteToggle}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <span className="material-symbols-outlined">
                  {muted ? "volume_off" : "volume_up"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {phase === "waiting" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg w-full"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="text-7xl mb-6"
            >
              ⏳
            </motion.div>
            <h2 className="font-headline font-black text-3xl md:text-4xl text-primary -rotate-1 mb-2">
              Get Ready!
            </h2>
            <p className="text-on-surface-variant font-body text-lg mb-6">
              Your teacher will start the game any second now...
            </p>

            {/* Live lobby — students joining */}
            {leaderboard.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-lowest rounded-[20px] p-5 shadow-[0_20px_40px_rgba(0,98,158,0.08)] mb-6"
              >
                <p className="text-sm font-headline font-bold text-on-surface-variant mb-4">
                  <span className="text-primary font-black text-lg">{leaderboard.length}</span>{" "}
                  player{leaderboard.length !== 1 ? "s" : ""} joined
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <AnimatePresence>
                    {leaderboard.map((entry) => {
                      const av = AVATARS.find((a) => a.id === entry.avatar_id);
                      return (
                        <motion.div
                          key={entry.student_id}
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 16 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md"
                            style={{ backgroundColor: av?.color ?? "#2E97E6" }}
                          >
                            {av?.emoji ?? "👤"}
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant truncate max-w-[60px]">
                            {entry.student_name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Scoring Rules Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,98,158,0.08)] text-left"
            >
              <p className="font-headline font-bold text-sm text-on-surface mb-3 text-center">
                📋 How Scoring Works
              </p>
              <div className="space-y-2 text-sm font-body text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="text-base">✅</span>
                  <span>Correct answer: <strong className="text-on-surface">100 points</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">✏️</span>
                  <span>Attempted: <strong className="text-on-surface">20 points</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">⏱️</span>
                  <span>Answer fast for <strong className="text-on-surface">bonus points</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🔥</span>
                  <span>Get a streak for <strong className="text-on-surface">glory!</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">❌</span>
                  <span>No negative points!</span>
                </div>
              </div>
            </motion.div>

            {pinCode && (
              <p className="text-sm text-on-surface-variant font-body mt-4">
                Game PIN: <span className="font-headline font-black text-primary text-xl">{pinCode}</span>
              </p>
            )}
          </motion.div>
        )}

        {phase !== "waiting" && phase !== "finished" && (
          <>
            {children}
            <StudentLeaderboardPanel />
          </>
        )}

        {/* Mini podium strip — always visible during play */}
        {phase !== "waiting" && phase !== "finished" && leaderboard.length > 0 && (
          <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-4px_20px_rgba(0,98,158,0.06)]">
            <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4 md:gap-8">
              {/* 2nd place */}
              {leaderboard[1] && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-base">🥈</span>
                  <span className="font-bold text-on-surface-variant truncate max-w-[80px]">{leaderboard[1].student_name}</span>
                  <span className="text-xs text-on-surface-variant">{leaderboard[1].total_score.toLocaleString()}</span>
                </div>
              )}
              {/* 1st place */}
              {leaderboard[0] && (
                <div className="flex items-center gap-1.5 text-base scale-110 px-3 py-1 rounded-full bg-secondary-container/30">
                  <span className="text-lg">🥇</span>
                  <span className="font-headline font-black text-on-surface truncate max-w-[80px]">{leaderboard[0].student_name}</span>
                  <span className="text-sm font-bold text-primary">{leaderboard[0].total_score.toLocaleString()}</span>
                </div>
              )}
              {/* 3rd place */}
              {leaderboard[2] && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-base">🥉</span>
                  <span className="font-bold text-on-surface-variant truncate max-w-[80px]">{leaderboard[2].student_name}</span>
                  <span className="text-xs text-on-surface-variant">{leaderboard[2].total_score.toLocaleString()}</span>
                </div>
              )}
              {/* My rank */}
              {myRank && myRank > 3 && (
                <div className="flex items-center gap-1 text-xs text-on-surface-variant px-2 py-1 rounded-full bg-surface-container-low">
                  <span className="font-headline font-bold">You: #{myRank}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "finished" && studentName && avatarId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="w-full max-w-[720px] flex flex-col items-center gap-6"
          >
            <div className="text-center">
              <div className="text-6xl mb-3" aria-hidden="true">
                🎉
              </div>
              <h2 className="font-headline font-black text-4xl md:text-5xl text-primary -rotate-1 mb-2">
                Game Over!
              </h2>
              <p className="font-body text-lg text-on-surface-variant">
                Here&apos;s your certificate —{" "}
                <span className="font-bold">download it to keep</span>
              </p>
            </div>

            {/* Scale the 960x680 certificate down to fit most mobile
                viewports. The ref still points at the real-size DOM so
                html2canvas captures at the full resolution. */}
            <div className="w-full overflow-hidden rounded-[24px]">
              <div
                className="origin-top-left"
                style={{
                  transform: "scale(var(--cert-scale, 0.6))",
                  width: 960,
                  height: 680,
                }}
              >
                <Certificate
                  ref={certificateRef}
                  rank={certificateRank}
                  totalStudents={totalStudents}
                  studentName={studentName}
                  avatarId={avatarId}
                  activityTitle={activityTitle ?? title ?? "Adventure Hub"}
                  score={myScore}
                  playedOn={new Date()}
                />
              </div>
            </div>

            <style>{`
              @media (min-width: 640px) { :root { --cert-scale: 0.7; } }
              @media (min-width: 768px) { :root { --cert-scale: 0.8; } }
              @media (min-width: 1024px) { :root { --cert-scale: 0.9; } }
              @media (max-width: 419px) { :root { --cert-scale: 0.42; } }
            `}</style>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handleDownload("png")}
                disabled={downloadBusy !== null}
                className="focus-ring h-12 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-black inline-flex items-center gap-2 shadow-md disabled:opacity-60"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {downloadBusy === "png" ? "progress_activity" : "image"}
                </span>
                {downloadBusy === "png" ? "Preparing…" : "Download PNG"}
              </button>
              <button
                type="button"
                onClick={() => handleDownload("pdf")}
                disabled={downloadBusy !== null}
                className="focus-ring h-12 px-6 rounded-full bg-secondary-container text-on-secondary-container font-headline font-black inline-flex items-center gap-2 shadow-md disabled:opacity-60"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {downloadBusy === "pdf" ? "progress_activity" : "picture_as_pdf"}
                </span>
                {downloadBusy === "pdf" ? "Preparing…" : "Download PDF"}
              </button>
            </div>

            <p className="font-body text-sm text-on-surface-variant">
              Final score:{" "}
              <span className="font-headline font-black text-2xl text-secondary">
                <AnimatedNumber value={myScore} />
              </span>
            </p>
          </motion.div>
        )}

        {/* Fallback used in the (rare) case we hit the finished phase
            before we've captured the student's name/avatar. Keeps the old
            simple score card rather than crashing the page. */}
        {phase === "finished" && (!studentName || !avatarId) && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="font-headline font-black text-5xl text-primary mb-2 -rotate-1">
              Game Over!
            </h2>
            <p className="font-body text-xl text-on-surface-variant">
              Your final score
            </p>
            <p className="font-headline font-black text-6xl text-secondary mt-2">
              <AnimatedNumber value={myScore} />
            </p>
          </motion.div>
        )}
      </main>

      {/* Floating streak toasts — non-interfering, left side */}
      <div className="fixed left-4 top-24 z-40 flex flex-col gap-2 pointer-events-none max-w-[260px]">
        <AnimatePresence>
          {streakToasts.slice(-4).map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: -200, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onAnimationComplete={() => {
                setTimeout(() => onDismissStreak?.(toast.id), 3000);
              }}
              className="bg-white/90 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg flex items-center gap-2 pointer-events-auto"
            >
              <span className="text-xl">{streakEmoji(toast.streak)}</span>
              <span className="font-headline font-bold text-sm text-on-surface truncate">
                {toast.name}
              </span>
              <span className="text-xs text-on-surface-variant font-body whitespace-nowrap">
                {toast.streak} in a row!
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
