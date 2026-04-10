"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface GameShellProps {
  children: React.ReactNode;
  title?: string;
  pinCode?: string;
  onMuteToggle?: () => void;
  muted?: boolean;
}

export function GameShell({ children, title, pinCode, onMuteToggle, muted }: GameShellProps) {
  const { studentName, avatarId, myScore, myStreak, phase } = useGameStore();

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

        {phase !== "waiting" && phase !== "finished" && children}

        {phase === "finished" && (
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
