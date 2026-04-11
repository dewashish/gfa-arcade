"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { RealtimeManager } from "@/lib/game-engine/realtime";
import { updateSessionStatus, endGameSession } from "@/lib/game-engine/session-manager";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";
import { useTimer } from "@/hooks/useTimer";
import { SpinWheel } from "@/components/games/SpinWheel";
import { Quiz } from "@/components/games/Quiz";
import { LiveLeaderboard } from "@/components/shared/LiveLeaderboard";
import { CelebrationOverlay } from "@/components/shared/CelebrationOverlay";
import { ShareWithClassModal } from "@/components/shared/ShareWithClassModal";
import { SimulateClassButton } from "@/components/dev/SimulateClassButton";
import type {
  ActivityConfig,
  SpinWheelConfig,
  QuizConfig,
} from "@/lib/game-engine/types";

interface Props {
  sessionId: string;
}

export function TeacherMonitorClient({ sessionId }: Props) {
  const store = useGameStore();
  const router = useRouter();
  const { play } = useSound();
  const timer = useTimer(300);
  const [participants, setParticipants] = useState(0);
  const [pinCode, setPinCode] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [presentMode, setPresentMode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState<"podium" | "list">("podium");
  const realtimeRef = useRef<RealtimeManager | null>(null);
  const supabaseRef = useRef(createClient());

  // ===== Leaderboard refresh (callable from realtime + polling) =====
  const refreshLeaderboard = useCallback(async () => {
    const supabase = supabaseRef.current;
    const { data: entries, error } = await supabase
      .from("leaderboard_entries")
      .select("student_id, total_score, students(name, avatar_id)")
      .eq("session_id", sessionId)
      .order("total_score", { ascending: false });

    if (error) {
      console.warn("[monitor] leaderboard refresh error:", error.message);
      return;
    }
    if (!entries) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = entries.map((e: any, idx: number) => ({
      student_id: e.student_id,
      student_name: e.students?.name ?? "Player",
      avatar_id: e.students?.avatar_id ?? "cat",
      total_score: e.total_score ?? 0,
      rank: idx + 1,
    }));
    store.setLeaderboard(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ===== Participant count refresh (also polled) =====
  const refreshParticipants = useCallback(async () => {
    const supabase = supabaseRef.current;
    const { count } = await supabase
      .from("session_participants")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    setParticipants(count ?? 0);
  }, [sessionId]);

  // ===== Init =====
  useEffect(() => {
    const supabase = supabaseRef.current;

    async function init() {
      const { data: session } = await supabase
        .from("game_sessions")
        .select("*, activities(*)")
        .eq("id", sessionId)
        .single();

      if (!session) return;

      store.setSession(session.id, session.pin_code);
      store.setTeacher(true);
      setPinCode(session.pin_code);

      const activity = session.activities as unknown as {
        config_json: ActivityConfig;
        title: string;
      };
      if (activity?.config_json) {
        store.setConfig(activity.config_json);
        setActivityTitle(activity.title);
      }

      if (session.status === "playing") {
        store.setPhase("playing");
        timer.start();
      } else if (session.status === "finished") {
        store.setPhase("finished");
      }

      await refreshParticipants();
      await refreshLeaderboard();

      // Realtime (best effort — polling is the reliable backup)
      const rtm = new RealtimeManager(supabase);
      realtimeRef.current = rtm;
      rtm.joinChannel(
        sessionId,
        (event) => {
          if (event.type === "game:join") {
            refreshParticipants();
            play("join");
          }
        },
        () => {
          refreshLeaderboard();
        }
      );
    }

    init();
    return () => realtimeRef.current?.leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ===== Polling fallback =====
  // postgres_changes can fail silently or take a while to propagate.
  // We poll the leaderboard + participant count every 1.5s while the session
  // is active so the UI updates reliably regardless of realtime state.
  useEffect(() => {
    if (store.phase === "finished") return;
    const id = setInterval(() => {
      refreshLeaderboard();
      refreshParticipants();
    }, 1500);
    return () => clearInterval(id);
  }, [store.phase, refreshLeaderboard, refreshParticipants]);

  async function handleStartGame() {
    play("whoosh");
    const supabase = supabaseRef.current;
    await updateSessionStatus(supabase, sessionId, "playing");
    store.setPhase("playing");
    timer.start();
    realtimeRef.current?.broadcastEvent({ type: "game:start" });
  }

  async function handleEndGame() {
    play("tada");
    const supabase = supabaseRef.current;
    await endGameSession(supabase, sessionId);
    store.setPhase("finished");
    timer.pause();
    realtimeRef.current?.broadcastEvent({ type: "game:end" });
    setShowCelebration(true);
  }

  function handleSpin(segmentIndex: number) {
    const config = store.config as SpinWheelConfig;
    const targetAngle =
      360 * 5 +
      (360 - segmentIndex * (360 / config.segments.length) - (360 / config.segments.length) / 2);
    store.setSpinResult(targetAngle, segmentIndex);
    store.setCurrentRound(store.currentRound + 1);
    realtimeRef.current?.broadcastEvent({
      type: "game:spin",
      angle: targetAngle,
      segmentIndex,
    });
  }

  function handleNextQuestion() {
    const config = store.config as QuizConfig;
    const next = store.currentQuestionIndex + 1;
    if (next >= config.questions.length) {
      handleEndGame();
      return;
    }
    play("whoosh");
    store.setCurrentQuestion(next);
    realtimeRef.current?.broadcastEvent({
      type: "game:next_question",
      questionIndex: next,
    });
  }

  // ===== Top winners for celebration =====
  const top3 = store.leaderboard.slice(0, 3);
  const winnerName = top3[0]?.student_name ?? "";
  const winnerScore = top3[0]?.total_score ?? 0;

  // ===== Game Renderer =====
  const renderGame = () => {
    if (!store.config || store.phase !== "playing") return null;
    if (store.config.type === "spin-wheel") {
      return (
        <SpinWheel
          config={store.config as SpinWheelConfig}
          isTeacher
          onSpin={handleSpin}
        />
      );
    }
    if (store.config.type === "quiz") {
      return (
        <Quiz
          config={store.config as QuizConfig}
          isTeacher
          onAnswer={() => {}}
          onNextQuestion={handleNextQuestion}
        />
      );
    }
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">👀</span>
        <p className="font-headline text-2xl font-bold text-on-surface">
          Students are playing on their devices
        </p>
        <p className="text-on-surface-variant font-body mt-2">
          Watch the leaderboard for live progress
        </p>
      </div>
    );
  };

  // ===== Presentation Mode =====
  if (presentMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0, 98, 158, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(254, 183, 0, 0.06) 0%, transparent 50%)",
        }}
      >
        {/* Minimal top bar */}
        <header className="px-8 py-4 flex items-center justify-between bg-white/70 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,98,158,0.06)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white">school</span>
            </div>
            <div>
              <p className="font-headline font-black text-primary text-lg">{activityTitle}</p>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                PIN {pinCode} · {participants} players
              </p>
            </div>
          </div>
          <button
            onClick={() => setPresentMode(false)}
            className="px-5 py-2 rounded-full bg-surface-container-low hover:bg-surface-container font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close_fullscreen</span>
            Exit Present
          </button>
        </header>

        {/* Big game area */}
        <main className="flex-1 flex items-center justify-center p-8 md:p-16">
          {renderGame() ?? (
            <div className="text-center">
              <p className="font-headline text-3xl text-on-surface-variant">
                Start the game to begin
              </p>
            </div>
          )}
        </main>

        {/* Bottom: full podium leaderboard (replaces previous mini list) */}
        {store.leaderboard.length > 0 && (
          <footer className="px-8 py-6 bg-white/70 backdrop-blur-xl border-t border-outline-variant/15 max-h-[40vh] overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <LiveLeaderboard variant="full" />
            </div>
          </footer>
        )}

        <CelebrationOverlay
          open={showCelebration}
          title={winnerName ? `${winnerName} wins!` : "Game Over!"}
          subtitle={winnerName ? `${winnerScore.toLocaleString()} points` : undefined}
          onDismiss={() => setShowCelebration(false)}
        />
      </motion.div>
    );
  }

  // ===== Normal Mode =====
  return (
    <div className="space-y-6">
      {/* ===== Session Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <motion.h1
            initial={{ rotate: 0 }}
            animate={{ rotate: -1 }}
            className="font-headline font-black text-3xl md:text-4xl text-primary origin-left"
          >
            {activityTitle || "Live Session"}
          </motion.h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="px-4 py-2 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-base">tag</span>
              <span className="font-headline font-black tracking-widest">{pinCode}</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-tertiary text-on-tertiary flex items-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-base">groups</span>
              <span className="font-bold">{participants} students</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-surface-container-lowest ambient-shadow flex items-center gap-2">
              <span className="material-symbols-outlined text-base">timer</span>
              <span className="font-headline font-bold">{timer.formatTime()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low">
              <div className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
              <span className="text-xs text-on-surface-variant font-body font-bold">LIVE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShareModal(true)}
            className="focus-ring inline-flex items-center justify-center gap-2 h-11 px-5 font-headline font-bold text-sm text-on-secondary-container bg-secondary-container rounded-full shadow-md"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              share
            </span>
            Share with Class
          </motion.button>
          <SimulateClassButton sessionId={sessionId} />
          {store.phase === "waiting" && (
            <motion.button
              whileHover={{ scale: participants > 0 ? 1.05 : 1 }}
              whileTap={{ scale: participants > 0 ? 0.95 : 1 }}
              disabled={participants === 0}
              onClick={handleStartGame}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-headline font-black text-lg text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg disabled:opacity-50"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Start Game
            </motion.button>
          )}
          {store.phase === "playing" && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPresentMode(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-headline font-bold text-base text-on-secondary-container bg-secondary-container rounded-full shadow-md"
              >
                <span className="material-symbols-outlined">present_to_all</span>
                Present
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndGame}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-headline font-bold text-base text-white bg-error rounded-full shadow-md"
              >
                <span className="material-symbols-outlined">stop</span>
                End Game
              </motion.button>
            </>
          )}
          {store.phase === "finished" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-headline font-bold text-base text-primary bg-surface-container-low rounded-full"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Dashboard
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ===== Main Split: Game + Leaderboard ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Area (2/3) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-xl p-6 md:p-10 ambient-shadow min-h-[500px] flex items-center justify-center"
          >
            {store.phase === "waiting" && (
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-7xl mb-6"
                >
                  👥
                </motion.div>
                <h2 className="font-headline font-black text-3xl text-primary mb-2 -rotate-1">
                  Waiting for students...
                </h2>
                <p className="text-on-surface-variant font-body text-lg">
                  Share PIN
                </p>
                <p className="font-headline font-black text-6xl text-primary tracking-widest my-4">
                  {pinCode}
                </p>
                <p className="text-sm text-on-surface-variant font-body">
                  {participants} student{participants !== 1 ? "s" : ""} joined so far
                </p>
              </div>
            )}

            {store.phase === "playing" && renderGame()}

            {store.phase === "finished" && (
              <div className="text-center">
                <div className="text-8xl mb-4">🏆</div>
                <h2 className="font-headline font-black text-4xl text-primary mb-2 -rotate-1">
                  Game Complete!
                </h2>
                {winnerName && (
                  <p className="font-headline text-2xl text-secondary mt-4">
                    🥇 {winnerName} — {winnerScore.toLocaleString()} pts
                  </p>
                )}
                <button
                  onClick={() => setShowCelebration(true)}
                  className="mt-6 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-headline font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined">celebration</span>
                  Show Celebration
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Leaderboard (1/3) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* View toggle */}
          <div
            role="radiogroup"
            aria-label="Leaderboard view"
            className="flex bg-surface-container-low rounded-full p-1 ambient-shadow"
          >
            {[
              { key: "podium", label: "🏆 Podium" },
              { key: "list", label: "📋 List" },
            ].map((opt) => (
              <button
                key={opt.key}
                role="radio"
                aria-checked={leaderboardView === opt.key}
                onClick={() => setLeaderboardView(opt.key as "podium" | "list")}
                className={`focus-ring flex-1 h-10 rounded-full font-headline font-bold text-sm transition-colors ${
                  leaderboardView === opt.key
                    ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow max-h-[75vh] overflow-y-auto">
            <LiveLeaderboard variant={leaderboardView === "podium" ? "full" : "compact"} />
          </div>
        </motion.div>
      </div>

      <CelebrationOverlay
        open={showCelebration}
        title={winnerName ? `${winnerName} wins!` : "Game Over!"}
        subtitle={winnerName ? `${winnerScore.toLocaleString()} points` : undefined}
        onDismiss={() => setShowCelebration(false)}
      />

      <ShareWithClassModal
        open={showShareModal}
        pinCode={pinCode}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
