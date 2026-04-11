"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StudentLeaderboardPanel } from "@/components/shared/StudentLeaderboardPanel";
import { Certificate } from "@/components/shared/Certificate";
import {
  downloadCertificateAsPng,
  downloadCertificateAsPdf,
} from "@/lib/certificate-download";
import { useConfetti } from "@/hooks/useConfetti";
import { useSound } from "@/hooks/useSound";

interface GameShellProps {
  children: React.ReactNode;
  title?: string;
  pinCode?: string;
  onMuteToggle?: () => void;
  muted?: boolean;
}

export function GameShell({ children, title, pinCode, onMuteToggle, muted }: GameShellProps) {
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
            className="text-center max-w-md"
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
            <p className="text-on-surface-variant font-body text-lg">
              Your teacher will start the game any second now...
            </p>
            {pinCode && (
              <p className="mt-6 text-sm text-on-surface-variant font-body">
                Game PIN: <span className="font-headline font-black text-primary text-xl">{pinCode}</span>
              </p>
            )}
          </motion.div>
        )}

        {phase !== "waiting" && phase !== "finished" && (
          <>
            {children}
            {/* Collapsible leaderboard — only visible while the game is
                active so it doesn't compete with the waiting / finished
                celebrations. */}
            <StudentLeaderboardPanel />
          </>
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
    </div>
  );
}
