"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { RealtimeManager } from "@/lib/game-engine/realtime";
import { calculateScore } from "@/lib/game-engine/score-calculator";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { GameShell } from "@/components/games/GameShell";
import { SpinWheel } from "@/components/games/SpinWheel";
import { MatchUp } from "@/components/games/MatchUp";
import { Quiz } from "@/components/games/Quiz";
import { FlashCards } from "@/components/games/FlashCards";
import { SpeakingCards } from "@/components/games/SpeakingCards";
import { CompleteSentence } from "@/components/games/CompleteSentence";
import { GroupSort } from "@/components/games/GroupSort";
import type {
  ActivityConfig,
  SpinWheelConfig,
  MatchUpConfig,
  QuizConfig,
  GameEvent,
} from "@/lib/game-engine/types";

interface Props {
  sessionId: string;
}

export function GamePlayClient({ sessionId }: Props) {
  const store = useGameStore();
  const router = useRouter();
  const { play, muted, toggleMute } = useSound();
  const { fireworks } = useConfetti();
  const realtimeRef = useRef<RealtimeManager | null>(null);
  const supabaseRef = useRef(createClient());
  const [nextActivityInfo, setNextActivityInfo] = useState<{
    title: string;
    sessionId: string;
    countdown: number;
  } | null>(null);

  // Load session data and subscribe to realtime
  useEffect(() => {
    const supabase = supabaseRef.current;

    async function init() {
      // Fetch session + activity
      const { data: session } = await supabase
        .from("game_sessions")
        .select("*, activities(*)")
        .eq("id", sessionId)
        .single();

      if (!session) return;

      store.setSession(session.id, session.pin_code);

      const activity = session.activities as unknown as {
        config_json: ActivityConfig;
        title: string;
      };
      if (activity?.config_json) {
        store.setConfig(activity.config_json);
      }
      if (activity?.title) {
        store.setActivityTitle(activity.title);
      }

      // Sync to whatever question the teacher has advanced to. Without this,
      // a student who joins after the teacher clicked "Next" renders question 0
      // until the next broadcast, skipping the question entirely.
      store.setCurrentQuestion(session.current_question_index ?? 0);

      if (session.status === "playing") {
        store.setPhase("playing");
      } else if (session.status === "finished") {
        store.setPhase("finished");
      }

      // Subscribe to realtime
      const rtm = new RealtimeManager(supabase);
      realtimeRef.current = rtm;

      rtm.joinChannel(
        sessionId,
        (event: GameEvent) => {
          switch (event.type) {
            case "game:start":
              store.setPhase("playing");
              play("join");
              break;
            case "game:spin":
              store.setSpinResult(event.angle, event.segmentIndex);
              break;
            case "game:next_question":
              store.setCurrentQuestion(event.questionIndex);
              break;
            case "game:end":
              store.setPhase("finished");
              fireworks();
              play("levelup");
              break;
            case "game:next_activity":
              // Show transition screen and auto-navigate
              setNextActivityInfo({
                title: event.activityTitle,
                sessionId: event.sessionId,
                countdown: 3,
              });
              play("whoosh");
              break;
          }
        },
        () => {
          // Leaderboard change — refetch
          supabase
            .rpc("get_session_leaderboard", { p_session_id: sessionId })
            .then(({ data }) => {
              if (data) store.setLeaderboard(data);
            });
        }
      );
    }

    init();

    return () => {
      realtimeRef.current?.leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Auto-navigate to next activity after countdown
  useEffect(() => {
    if (!nextActivityInfo) return;
    if (nextActivityInfo.countdown <= 0) {
      // Re-join the new session with the same student identity
      const studentId = store.studentId;
      const studentName = store.studentName;
      const avatarId = store.avatarId;
      store.reset();
      if (studentId) store.setStudent(studentId, studentName ?? "", avatarId ?? "cat");
      router.replace(`/play/${nextActivityInfo.sessionId}`);
      return;
    }
    const timer = setTimeout(() => {
      setNextActivityInfo((prev) =>
        prev ? { ...prev, countdown: prev.countdown - 1 } : null
      );
      play("tick");
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextActivityInfo]);

  async function submitScore(
    questionIndex: number,
    isCorrect: boolean,
    timeTakenMs: number,
    opts?: { selectedIndex?: number | null; segmentValue?: number }
  ) {
    if (!store.studentId || !store.config) return;

    const score = calculateScore({
      gameType: store.config.type,
      isCorrect,
      timeTakenMs,
      timeLimitMs: 30000,
      streak: store.myStreak,
      segmentValue: opts?.segmentValue,
    });

    if (isCorrect) {
      store.incrementStreak();
    } else {
      store.resetStreak();
    }

    store.addScore(score);

    // selected_index persists what the student actually picked so the
    // teacher's per-student detail modal (feature 3) can show "picked
    // option B, correct was option C" instead of just ✓/✗.
    await supabaseRef.current.from("game_scores").insert({
      session_id: sessionId,
      student_id: store.studentId,
      score,
      question_index: questionIndex,
      is_correct: isCorrect,
      time_taken_ms: timeTakenMs,
      selected_index: opts?.selectedIndex ?? null,
    });
  }

  function renderGame() {
    if (!store.config) return null;

    switch (store.config.type) {
      case "spin-wheel":
        return (
          <SpinWheel
            config={store.config as SpinWheelConfig}
            isTeacher={false}
          />
        );
      case "match-up":
        return (
          <MatchUp
            config={store.config as MatchUpConfig}
            onAnswer={(pairIndex, correct, timeTakenMs) =>
              submitScore(pairIndex, correct, timeTakenMs, {
                selectedIndex: pairIndex,
              })
            }
          />
        );
      case "quiz":
        return (
          <Quiz
            config={store.config as QuizConfig}
            isTeacher={false}
            onAnswer={(qi, selected, correct, timeTakenMs) =>
              submitScore(qi, correct, timeTakenMs, { selectedIndex: selected })
            }
          />
        );
      case "flashcards":
        return <FlashCards config={store.config as import("@/lib/game-engine/types").FlashCardsConfig} />;
      case "speaking-cards":
        return <SpeakingCards config={store.config as import("@/lib/game-engine/types").SpeakingCardsConfig} />;
      case "complete-sentence":
        return (
          <CompleteSentence
            config={store.config as import("@/lib/game-engine/types").CompleteSentenceConfig}
            onAnswer={(si, correct, timeTakenMs) =>
              submitScore(si, correct, timeTakenMs, { selectedIndex: si })
            }
          />
        );
      case "group-sort":
        return (
          <GroupSort
            config={store.config as import("@/lib/game-engine/types").GroupSortConfig}
            onAnswer={(ii, correct, timeTakenMs) =>
              submitScore(ii, correct, timeTakenMs, { selectedIndex: ii })
            }
          />
        );
      default:
        return <p className="text-on-surface-variant">Unknown game type</p>;
    }
  }

  // ===== Next Activity Transition Screen =====
  if (nextActivityInfo) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center"
      >
        <div className="text-center text-white space-y-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="text-7xl"
          >
            🚀
          </motion.div>
          <h2 className="font-headline font-black text-3xl md:text-5xl">
            Next up!
          </h2>
          <p className="font-headline font-bold text-xl md:text-2xl opacity-90">
            {nextActivityInfo.title}
          </p>
          <motion.div
            key={nextActivityInfo.countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-headline font-black text-8xl"
          >
            {nextActivityInfo.countdown > 0 ? nextActivityInfo.countdown : "GO!"}
          </motion.div>
          <p className="text-sm opacity-70 font-body">Get ready...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <GameShell
      title={store.config?.type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      onMuteToggle={toggleMute}
      muted={muted}
    >
      {renderGame()}
    </GameShell>
  );
}
