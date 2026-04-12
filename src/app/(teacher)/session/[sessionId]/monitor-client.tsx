"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
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
import { AnswerStatusPanel } from "@/components/shared/AnswerStatusPanel";
import { StudentDetailModal } from "@/components/shared/StudentDetailModal";
import { CertificatesPreviewModal } from "@/components/shared/CertificatesPreviewModal";
import { SimulateClassButton } from "@/components/dev/SimulateClassButton";
import type {
  ActivityConfig,
  SpinWheelConfig,
  QuizConfig,
} from "@/lib/game-engine/types";

/** Playlist sibling session shape fetched when the current session
 *  belongs to a class plan. */
interface PlaylistSibling {
  id: string;
  activity_id: string;
  playlist_order: number;
  status: "waiting" | "playing" | "finished";
  activities: { title: string; game_type: string } | null;
}

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
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [leaderboardView, setLeaderboardView] = useState<"podium" | "list">("podium");
  const [playlistSiblings, setPlaylistSiblings] = useState<PlaylistSibling[]>([]);
  const [currentPlaylistOrder, setCurrentPlaylistOrder] = useState<number>(0);
  const isPlaylist = playlistSiblings.length > 1;
  const [, startTransition] = useTransition();
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

  // ===== Answered-status refresh (feature 2) =====
  // Queries game_scores for the current question index and pushes the
  // resulting set of student_ids into the store so AnswerStatusPanel can
  // render the still-thinking / answered split.
  const refreshAnswered = useCallback(async () => {
    if (store.phase !== "playing") return;
    const supabase = supabaseRef.current;
    const { data, error } = await supabase
      .from("game_scores")
      .select("student_id")
      .eq("session_id", sessionId)
      .eq("question_index", store.currentQuestionIndex);
    if (error) {
      console.warn("[monitor] answered refresh error:", error.message);
      return;
    }
    if (!data) return;
    const ids = Array.from(new Set(data.map((r) => r.student_id)));
    store.setAnsweredStudentIds(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, store.phase, store.currentQuestionIndex]);

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

      // Restore persisted question index so a teacher refresh doesn't
      // snap the view back to question 0.
      store.setCurrentQuestion(session.current_question_index ?? 0);

      // Detect playlist mode — fetch sibling sessions
      if (session.class_plan_id) {
        const { data: siblings } = await supabase
          .from("game_sessions")
          .select("id, activity_id, playlist_order, status, activities(title, game_type)")
          .eq("class_plan_id", session.class_plan_id)
          .order("playlist_order", { ascending: true });
        if (siblings) {
          setPlaylistSiblings(
            siblings.map((s) => ({
              ...s,
              playlist_order: s.playlist_order ?? 0,
              activities: s.activities as unknown as { title: string; game_type: string } | null,
            }))
          );
          setCurrentPlaylistOrder(session.playlist_order ?? 0);
        }
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
  // We poll the leaderboard + participant count + answered-set every 2s
  // while the session is active. Perf-critical bits:
  //  - `Promise.all` fires the three queries in parallel so the slowest
  //    one caps the tick cost instead of summing them.
  //  - `document.visibilityState` guard skips the tick when the tab is
  //    backgrounded (e.g., teacher switched to Classroom tab) — no point
  //    hammering Supabase when nobody's looking.
  useEffect(() => {
    if (store.phase === "finished") return;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      Promise.all([
        refreshLeaderboard(),
        refreshParticipants(),
        refreshAnswered(),
      ]).catch((err) => {
        console.warn("[monitor] poll tick failed:", err);
      });
    }, 2000);
    return () => clearInterval(id);
  }, [store.phase, refreshLeaderboard, refreshParticipants, refreshAnswered]);

  function handleStartGame() {
    // Optimistic: flip local state first so the UI reacts instantly.
    // The DB write happens in a transition in the background; the 1.5s
    // polling loop + realtime subscription self-heal if anything drifts.
    play("whoosh");
    store.setCurrentQuestion(0);
    store.setAnsweredStudentIds([]);
    store.setPhase("playing");
    timer.start();
    realtimeRef.current?.broadcastEvent({ type: "game:start" });
    startTransition(async () => {
      const supabase = supabaseRef.current;
      const { error } = await supabase
        .from("game_sessions")
        .update({ status: "playing", current_question_index: 0 })
        .eq("id", sessionId);
      if (error) console.warn("[monitor] startGame persist failed:", error.message);
    });
  }

  function handleEndGame() {
    // Optimistic: phase flips to "finished" immediately so the teacher
    // sees the celebration overlay without waiting for the RPC.
    play("tada");
    store.setPhase("finished");
    timer.pause();
    realtimeRef.current?.broadcastEvent({ type: "game:end" });
    setShowCelebration(true);
    startTransition(async () => {
      try {
        await endGameSession(supabaseRef.current, sessionId);
      } catch (err) {
        console.warn("[monitor] endGame persist failed:", err);
      }
    });
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
    // Optimistic local advance so the teacher sees the next question
    // the moment she clicks, not after the Supabase round-trip.
    store.setCurrentQuestion(next);
    // Fresh question → nobody has answered yet. Reset immediately so the
    // teacher sees an empty "Answered" strip the instant she advances.
    store.setAnsweredStudentIds([]);
    realtimeRef.current?.broadcastEvent({
      type: "game:next_question",
      questionIndex: next,
    });
    startTransition(async () => {
      // Persist server-side so any student who joins after this point
      // reads the right question instead of re-rendering question 0.
      const { error } = await supabaseRef.current
        .from("game_sessions")
        .update({ current_question_index: next })
        .eq("id", sessionId);
      if (error) console.warn("[monitor] nextQuestion persist failed:", error.message);
    });
  }

  // ===== Next Activity in Playlist =====
  function handleNextActivity() {
    const nextOrder = currentPlaylistOrder + 1;
    const nextSession = playlistSiblings.find((s) => s.playlist_order === nextOrder);
    if (!nextSession) return;

    // Broadcast to students that a new activity is coming
    realtimeRef.current?.broadcastEvent({
      type: "game:next_activity",
      sessionId: nextSession.id,
      activityTitle: nextSession.activities?.title ?? "Next Activity",
      order: nextOrder,
    });

    // Navigate teacher to the next session monitor
    startTransition(() => {
      router.push(`/session/${nextSession.id}`);
    });
  }

  const hasNextActivity = isPlaylist && currentPlaylistOrder < playlistSiblings.length - 1;

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

        {/* Side-by-side: Game (left) + Leaderboard (right) */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-[3] flex items-center justify-center p-8 md:p-12 overflow-y-auto">
            {renderGame() ?? (
              <div className="text-center">
                <p className="font-headline text-3xl text-on-surface-variant">
                  Start the game to begin
                </p>
              </div>
            )}
          </main>

          {store.leaderboard.length > 0 && (
            <aside className="flex-[2] border-l border-outline-variant/15 bg-white/70 backdrop-blur-xl overflow-y-auto p-6">
              <LiveLeaderboard variant="full" onRowClick={setSelectedStudentId} />
            </aside>
          )}
        </div>

        <CelebrationOverlay
          open={showCelebration}
          title={winnerName ? `${winnerName} wins!` : "Game Over!"}
          subtitle={winnerName ? `${winnerScore.toLocaleString()} points` : undefined}
          onDismiss={() => setShowCelebration(false)}
        />
      </motion.div>
    );
  }

  // ===== Accuracy rate (computed from answered data) =====
  const totalAnswered = store.answeredStudentIds.length;
  const accuracyPct = participants > 0
    ? Math.round((totalAnswered / participants) * 100)
    : 0;

  // Game type icon mapping for playlist strip
  const gameTypeIcon = (gt: string) => {
    switch (gt) {
      case "quiz": return "quiz";
      case "match-up": return "grid_view";
      case "group-sort": return "category";
      case "flashcards": return "style";
      case "spin-wheel": return "attractions";
      case "speaking-cards": return "mic";
      case "complete-sentence": return "edit_note";
      default: return "gamepad";
    }
  };

  // Medal colors for leaderboard
  const medalColor = (rank: number) => {
    if (rank === 1) return "text-amber-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-orange-600";
    return "text-on-surface-variant";
  };

  // ===== Normal Mode =====
  return (
    <div>
      {/* ===== FIXED TOP BAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm flex justify-between items-center px-8 h-20 shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tight text-primary rotate-[-2deg] font-headline">
            {activityTitle || "Live Session"}
          </h1>
          <div className="flex items-center gap-3 bg-surface-container px-6 py-2 rounded-full">
            <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Join PIN</span>
            <span className="text-3xl font-black font-headline text-primary tracking-tighter">{pinCode}</span>
            <button
              onClick={() => setShowShareModal(true)}
              className="ml-2 p-2 bg-primary-container text-white rounded-full hover:scale-105 transition-transform flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-base">share</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low">
            <div className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
            <span className="text-xs text-on-surface-variant font-body font-bold">LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-primary text-base">timer</span>
            <span className="font-headline font-bold text-xl text-primary">{timer.formatTime()}</span>
          </div>
          <SimulateClassButton sessionId={sessionId} />
          {store.phase === "waiting" && (
            <motion.button
              whileHover={{ scale: participants > 0 ? 1.05 : 1 }}
              whileTap={{ scale: participants > 0 ? 0.95 : 1 }}
              disabled={participants === 0}
              onClick={handleStartGame}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-headline font-black text-lg text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg disabled:opacity-50 active:scale-95 transition-all"
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
                className="font-label font-medium text-on-surface-variant hover:text-primary transition-colors px-3 py-2"
              >
                <span className="material-symbols-outlined text-base mr-1 align-middle">present_to_all</span>
                Present
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndGame}
                className="bg-error text-on-error px-8 py-3 rounded-full font-headline font-bold text-base shadow-[0_20px_40px_rgba(0,98,158,0.08)] active:scale-95 transition-all"
              >
                End Session
              </motion.button>
            </>
          )}
          {store.phase === "finished" && (
            <div className="flex items-center gap-3">
              {hasNextActivity && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextActivity}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 font-headline font-black text-base text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg"
                >
                  <span className="material-symbols-outlined">skip_next</span>
                  Next Activity
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 font-headline font-bold text-sm text-primary bg-surface-container-low rounded-full"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Dashboard
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-28 px-8 pb-12">

        {/* ===== PLAYLIST ACTIVITY STRIP ===== */}
        {isPlaylist && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="font-headline font-bold text-on-surface-variant uppercase tracking-widest text-sm">
                Playlist Progress · Activity {currentPlaylistOrder + 1} of {playlistSiblings.length}
              </h2>
              <div className="flex items-center gap-1">
                {playlistSiblings.map((sib) => (
                  <div
                    key={sib.id}
                    className={`w-2 h-2 rounded-full ${
                      sib.playlist_order <= currentPlaylistOrder
                        ? "bg-primary"
                        : "bg-surface-container-highest"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {playlistSiblings.map((sib, i) => {
                const isCurrent = sib.playlist_order === currentPlaylistOrder;
                const isDone = sib.status === "finished";
                const gt = sib.activities?.game_type ?? "quiz";
                return (
                  <div key={sib.id} className="flex items-center gap-3 shrink-0">
                    {i > 0 && (
                      <span className="material-symbols-outlined text-outline-variant text-base">chevron_right</span>
                    )}
                    <button
                      onClick={() => { if (!isCurrent) router.push(`/session/${sib.id}`); }}
                      className={`min-w-[240px] rounded-xl p-5 flex items-center gap-4 transition-all ${
                        isCurrent
                          ? "min-w-[280px] bg-surface-container-lowest p-6 border-2 border-primary-container shadow-[0_0_25px_rgba(46,151,230,0.3)] relative overflow-hidden"
                          : isDone
                            ? "bg-surface-container opacity-60"
                            : "bg-surface-container-low hover:bg-surface-container"
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary-container/10 rounded-bl-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDone
                          ? "bg-tertiary-container text-white"
                          : isCurrent
                            ? "bg-primary-container text-white w-14 h-14"
                            : "bg-surface-container-highest text-on-surface-variant"
                      }`}>
                        <span className="material-symbols-outlined" style={isDone ? {} : { fontVariationSettings: "'FILL' 1" }}>
                          {isDone ? "check" : gameTypeIcon(gt)}
                        </span>
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase ${isCurrent ? "text-primary" : "text-on-surface-variant"}`}>
                          {isCurrent ? "Current" : isDone ? gt : gt}
                        </p>
                        <h4 className={`font-headline font-bold ${isCurrent ? "text-lg" : ""}`}>
                          {sib.activities?.title ?? `Activity ${i + 1}`}
                        </h4>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ===== 8/4 GRID LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===== LEFT: GAME AREA (col-span-8) ===== */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-container-lowest rounded-xl p-6 md:p-10 shadow-[0_20px_40px_rgba(0,98,158,0.08)] min-h-[500px] flex items-center justify-center relative"
            >
              {/* ===== WAITING STATE ===== */}
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
                  <p className="text-on-surface-variant font-body text-lg">Share PIN</p>
                  <p className="font-headline font-black text-6xl text-primary tracking-widest my-4">{pinCode}</p>
                  <p className="text-sm text-on-surface-variant font-body">
                    {participants} student{participants !== 1 ? "s" : ""} joined so far
                  </p>
                </div>
              )}

              {/* ===== PLAYING STATE ===== */}
              {store.phase === "playing" && renderGame()}

              {/* ===== FINISHED STATE ===== */}
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
                  <div className="flex items-center justify-center gap-3 flex-wrap mt-6">
                    <button
                      onClick={() => setShowCelebration(true)}
                      className="px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-headline font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined">celebration</span>
                      Show Celebration
                    </button>
                    <button
                      onClick={() => setShowCertificatesModal(true)}
                      className="px-6 py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-md"
                    >
                      <span className="material-symbols-outlined">workspace_premium</span>
                      Certificates
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Student progress bar (playing phase) */}
            {store.phase === "playing" && participants > 0 && (
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-on-surface-variant">Student Progress</span>
                    <span className="text-primary">{totalAnswered} of {participants} answered</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary-container rounded-full transition-all duration-500 relative"
                      style={{ width: `${participants > 0 ? (totalAnswered / participants) * 100 : 0}%` }}
                    >
                      <div
                        className="absolute inset-0 animate-pulse opacity-30"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Answered / still-thinking split while a quiz is running */}
            {store.phase === "playing" && store.config?.type === "quiz" && (
              <AnswerStatusPanel onStudentClick={setSelectedStudentId} />
            )}

            {/* Pacing info + Next Activity */}
            {isPlaylist && (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6 text-on-surface-variant font-medium text-sm">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Activity {currentPlaylistOrder + 1} of {playlistSiblings.length}
                  </span>
                </div>
                {store.phase === "finished" && hasNextActivity && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextActivity}
                    className="bg-gradient-to-r from-primary to-primary-container text-white px-10 py-4 rounded-full font-headline font-bold shadow-[0_20px_40px_rgba(0,98,158,0.08)] active:scale-95 transition-all"
                  >
                    Next Activity →
                  </motion.button>
                )}
                {store.phase !== "finished" && (
                  <button
                    className="bg-surface-container-highest text-outline-variant px-10 py-4 rounded-full font-headline font-bold cursor-not-allowed"
                    disabled
                  >
                    Next Activity
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ===== RIGHT: SIDEBAR (col-span-4) ===== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 flex flex-col gap-6"
          >
            {/* Students Online + Mini Leaderboard */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_rgba(0,163,150,0.5)]" />
                  <h3 className="font-headline font-bold text-lg">{participants} Students Online</h3>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">group</span>
              </div>

              {/* Mini Leaderboard — top 5 */}
              <div className="space-y-3 mb-8">
                {store.leaderboard.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-4 font-body">
                    Waiting for players to join...
                  </p>
                ) : (
                  store.leaderboard.slice(0, 5).map((entry, idx) => {
                    const rank = idx + 1;
                    const avatarEmoji =
                      entry.avatar_id
                        ? (
                            // eslint-disable-next-line @typescript-eslint/no-var-requires
                            [
                              { id: "cat", emoji: "🐱" }, { id: "dog", emoji: "🐶" }, { id: "penguin", emoji: "🐧" },
                              { id: "bunny", emoji: "🐰" }, { id: "bear", emoji: "🐻" }, { id: "owl", emoji: "🦉" },
                              { id: "fox", emoji: "🦊" }, { id: "panda", emoji: "🐼" }, { id: "lion", emoji: "🦁" },
                              { id: "unicorn", emoji: "🦄" }, { id: "dragon", emoji: "🐉" }, { id: "robot", emoji: "🤖" },
                              { id: "astronaut", emoji: "🧑‍🚀" }, { id: "superhero", emoji: "🦸" },
                              { id: "star", emoji: "⭐" }, { id: "rocket", emoji: "🚀" },
                            ].find((a) => a.id === entry.avatar_id)?.emoji ?? "👤"
                          )
                        : "👤";
                    return (
                      <button
                        key={entry.student_id}
                        onClick={() => setSelectedStudentId(entry.student_id)}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/80 transition-colors text-left ${
                          rank <= 3 ? "bg-white/50" : ""
                        }`}
                      >
                        <span className={`font-black italic w-4 text-sm ${medalColor(rank)}`}>{rank}</span>
                        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-lg">
                          {avatarEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{entry.student_name}</p>
                          <p className="text-xs text-on-surface-variant">{entry.total_score.toLocaleString()} pts</p>
                        </div>
                        {rank <= 3 && (
                          <span
                            className={`material-symbols-outlined ${medalColor(rank)}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            workspace_premium
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Accuracy Rate */}
              {store.phase === "playing" && (
                <div className="border-t border-outline-variant/20 pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-headline font-bold">Response Rate</h4>
                    <span className="text-2xl font-black font-headline text-tertiary">{accuracyPct}%</span>
                  </div>
                  <div className="h-6 bg-surface-container-highest rounded-full overflow-hidden p-1">
                    <div
                      className="h-full bg-tertiary-container rounded-full transition-all duration-500"
                      style={{ width: `${accuracyPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3 text-center">
                    {totalAnswered === participants && participants > 0
                      ? "Everyone has answered!"
                      : `${participants - totalAnswered} still thinking...`}
                  </p>
                </div>
              )}
            </div>

            {/* Branding Card */}
            <div className="bg-primary rounded-xl p-8 text-on-primary shadow-[0_20px_40px_rgba(0,98,158,0.08)] relative overflow-hidden flex flex-col items-center justify-center text-center">
              <div className="relative z-10">
                <div className="text-3xl font-black font-headline mb-2">Founders Arcade</div>
                <p className="font-medium text-primary-fixed">Interactive Session Monitor</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ===== MODALS (unchanged) ===== */}
      <CelebrationOverlay
        open={showCelebration}
        title={winnerName ? `${winnerName} wins!` : "Game Over!"}
        subtitle={winnerName ? `${winnerScore.toLocaleString()} points` : undefined}
        onDismiss={() => setShowCelebration(false)}
      />

      <StudentDetailModal
        open={!!selectedStudentId}
        sessionId={sessionId}
        studentId={selectedStudentId}
        activityConfig={store.config}
        onClose={() => setSelectedStudentId(null)}
      />

      <CertificatesPreviewModal
        open={showCertificatesModal}
        activityTitle={activityTitle}
        onClose={() => setShowCertificatesModal(false)}
      />

      <ShareWithClassModal
        open={showShareModal}
        pinCode={pinCode}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
