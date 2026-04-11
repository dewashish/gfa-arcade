"use client";

import { useEffect, useRef } from "react";
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
  const { play, muted, toggleMute } = useSound();
  const { fireworks } = useConfetti();
  const realtimeRef = useRef<RealtimeManager | null>(null);
  const supabaseRef = useRef(createClient());

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

      const config = session.activities as unknown as { config_json: ActivityConfig };
      if (config?.config_json) {
        store.setConfig(config.config_json);
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

  async function submitScore(
    questionIndex: number,
    isCorrect: boolean,
    timeTakenMs: number,
    segmentValue?: number
  ) {
    if (!store.studentId || !store.config) return;

    const score = calculateScore({
      gameType: store.config.type,
      isCorrect,
      timeTakenMs,
      timeLimitMs: 30000,
      streak: store.myStreak,
      segmentValue,
    });

    if (isCorrect) {
      store.incrementStreak();
    } else {
      store.resetStreak();
    }

    store.addScore(score);

    await supabaseRef.current.from("game_scores").insert({
      session_id: sessionId,
      student_id: store.studentId,
      score,
      question_index: questionIndex,
      is_correct: isCorrect,
      time_taken_ms: timeTakenMs,
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
              submitScore(pairIndex, correct, timeTakenMs)
            }
          />
        );
      case "quiz":
        return (
          <Quiz
            config={store.config as QuizConfig}
            isTeacher={false}
            onAnswer={(qi, _selected, correct, timeTakenMs) =>
              submitScore(qi, correct, timeTakenMs)
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
            onAnswer={(si, correct, timeTakenMs) => submitScore(si, correct, timeTakenMs)}
          />
        );
      case "group-sort":
        return (
          <GroupSort
            config={store.config as import("@/lib/game-engine/types").GroupSortConfig}
            onAnswer={(ii, correct, timeTakenMs) => submitScore(ii, correct, timeTakenMs)}
          />
        );
      default:
        return <p className="text-on-surface-variant">Unknown game type</p>;
    }
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
