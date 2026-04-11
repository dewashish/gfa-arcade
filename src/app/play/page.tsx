"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { joinGameSession } from "@/lib/game-engine/session-manager";
import { AVATARS } from "@/lib/game-engine/types";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";

type Step = "pin" | "name" | "avatar";

const decorVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -10 },
  show: { opacity: 1, scale: 1, rotate: 0 },
};

export default function StudentJoinPage() {
  return (
    <Suspense fallback={null}>
      <StudentJoinContent />
    </Suspense>
  );
}

function StudentJoinContent() {
  const searchParams = useSearchParams();
  const pinFromUrl = (searchParams.get("pin") ?? "").replace(/\D/g, "").slice(0, 6);

  const [step, setStep] = useState<Step>(pinFromUrl.length === 6 ? "name" : "pin");
  const [pin, setPin] = useState(pinFromUrl);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("lion");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSession, setStudent } = useGameStore();
  const { play } = useSound();

  // Watch for late ?pin= changes (e.g. via share link)
  useEffect(() => {
    if (pinFromUrl.length === 6 && pin !== pinFromUrl) {
      setPin(pinFromUrl);
      setStep("name");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinFromUrl]);

  async function handleJoin() {
    if (!pin || !name) return;
    play("join");
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { session, student } = await joinGameSession(
        supabase,
        pin.trim(),
        name.trim(),
        selectedAvatar
      );

      setSession(session.id, session.pin_code);
      setStudent(student.id, student.name, student.avatar_id);
      router.push(`/play/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join. Check your PIN!");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-x-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(0, 98, 158, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(254, 183, 0, 0.06) 0%, transparent 50%)",
      }}
    >
      {/* Background Decorations */}
      <motion.div
        variants={decorVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute top-10 left-10 opacity-30 md:opacity-50 -rotate-12 text-7xl md:text-9xl select-none pointer-events-none"
      >
        🤖
      </motion.div>
      <motion.div
        variants={decorVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-10 right-10 opacity-30 md:opacity-50 rotate-12 text-7xl md:text-9xl select-none pointer-events-none"
      >
        ⭐
      </motion.div>
      <motion.div
        variants={decorVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute top-1/4 right-20 opacity-20 md:opacity-40 rotate-6 text-5xl md:text-7xl select-none pointer-events-none"
      >
        🎈
      </motion.div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        {step === "pin" && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: -50 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0_30px_60px_rgba(0,98,158,0.12)] p-8 md:p-16 text-center z-10"
          >
            {/* Branding */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-white text-3xl">school</span>
              </div>
              <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                GEMS Founders School
              </p>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
              className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface leading-tight mb-8 origin-center"
            >
              Enter Game PIN to <br />
              <span className="text-primary-container">Join the Adventure!</span>
            </motion.h1>

            <div className="relative group max-w-md mx-auto mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary-container rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-300" />
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-6 text-primary text-3xl">
                  tag
                </span>
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary-container/30 rounded-full py-6 pl-16 pr-8 text-3xl font-headline font-black text-center tracking-[0.5em] text-on-surface placeholder:text-outline-variant placeholder:font-medium transition-all outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: pin.length === 6 ? 1.05 : 1 }}
              whileTap={{ scale: pin.length === 6 ? 0.95 : 1 }}
              disabled={pin.length !== 6}
              onClick={() => {
                play("pop");
                setError("");
                setStep("name");
              }}
              className="inline-flex items-center justify-center gap-3 px-12 py-5 font-headline font-black text-2xl text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              NEXT
              <span className="material-symbols-outlined text-3xl">arrow_forward</span>
            </motion.button>

            {/* Bottom Tip */}
            <p className="mt-10 text-on-surface-variant font-medium text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">
                verified_user
              </span>
              Ask your teacher for the PIN code
            </p>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, scale: 0.92, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: -50 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0_30px_60px_rgba(0,98,158,0.12)] p-8 md:p-16 text-center z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ type: "spring", stiffness: 220 }}
              className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface leading-tight mb-8 origin-center"
            >
              Enter Your Name to <br />
              <span className="text-primary-container">Join the Adventure!</span>
            </motion.h1>

            <div className="relative group max-w-md mx-auto mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary-container rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-300" />
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-6 text-primary text-3xl">
                  face
                </span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name here..."
                  className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary-container/30 rounded-full py-6 pl-16 pr-8 text-2xl font-bold text-on-surface placeholder:text-outline-variant placeholder:font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  play("pop");
                  setStep("pin");
                }}
                className="px-8 py-4 text-primary font-headline font-bold rounded-full hover:bg-primary/5 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: name.trim() ? 1.05 : 1 }}
                whileTap={{ scale: name.trim() ? 0.95 : 1 }}
                disabled={!name.trim()}
                onClick={() => {
                  play("pop");
                  setStep("avatar");
                }}
                className="inline-flex items-center justify-center gap-3 px-12 py-5 font-headline font-black text-2xl text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                PICK BUDDY
                <span className="material-symbols-outlined text-3xl">arrow_forward</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "avatar" && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.92, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-[0_30px_60px_rgba(0,98,158,0.12)] p-8 md:p-12 z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ type: "spring", stiffness: 220 }}
              className="font-headline font-extrabold text-3xl md:text-5xl text-on-surface leading-tight mb-2 text-center origin-center"
            >
              Pick Your <span className="text-primary-container">Adventure Buddy!</span>
            </motion.h1>
            <p className="text-on-surface-variant font-body text-center mb-8">
              Tap the character that&apos;s most like you
            </p>

            <div className="grid grid-cols-4 gap-3 md:gap-4 mb-8">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <motion.button
                    key={avatar.id}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      play("pop");
                      setSelectedAvatar(avatar.id);
                    }}
                    className={`
                      relative flex flex-col items-center gap-1 p-3 md:p-4 rounded-2xl transition-all
                      ${isSelected ? "bg-white ring-4 ring-primary-container shadow-xl scale-105" : "bg-surface-container-low hover:bg-surface-container"}
                    `}
                    style={{
                      boxShadow: isSelected ? `0 12px 30px ${avatar.color}40` : undefined,
                    }}
                  >
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-2 -right-2 bg-secondary-container text-on-secondary-container text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md"
                      >
                        ✓
                      </motion.span>
                    )}
                    <span
                      className="text-4xl md:text-5xl"
                      style={{
                        filter: isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : undefined,
                      }}
                    >
                      {avatar.emoji}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-on-surface-variant">
                      {avatar.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-error-container text-on-error-container text-sm font-body text-center font-bold"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  play("pop");
                  setStep("name");
                }}
                className="px-8 py-4 text-primary font-headline font-bold rounded-full hover:bg-primary/5 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                disabled={loading}
                onClick={handleJoin}
                className="inline-flex items-center justify-center gap-3 px-14 py-5 font-headline font-black text-3xl text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                    JOINING...
                  </>
                ) : (
                  <>
                    GO!
                    <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6 z-10"
      >
        {[
          { icon: "star", label: "Collect Stars", color: "text-tertiary" },
          { icon: "emoji_events", label: "Win Trophies", color: "text-secondary" },
          { icon: "videogame_asset", label: "Play Games", color: "text-primary" },
        ].map((feat) => (
          <div
            key={feat.icon}
            className="bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm"
          >
            <span
              className={`material-symbols-outlined ${feat.color} text-2xl`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {feat.icon}
            </span>
            <span className="font-bold text-sm text-on-surface-variant">{feat.label}</span>
          </div>
        ))}
      </motion.div>

      <footer className="mt-10 text-center text-outline-variant text-xs font-medium">
        Adventure Hub © 2026 · Powered by Masdar City Spirit
      </footer>
    </div>
  );
}
