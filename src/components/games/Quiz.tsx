"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { TimerRing } from "@/components/ui/TimerRing";
import { StudentTimer } from "@/components/games/StudentTimer";
import { VisualRegistry } from "@/components/games/visuals/VisualRegistry";
import type { QuizConfig } from "@/lib/game-engine/types";

interface QuizProps {
  config: QuizConfig;
  isTeacher: boolean;
  onAnswer: (questionIndex: number, selectedOption: number, correct: boolean, timeTakenMs: number) => void;
  onNextQuestion?: () => void;
}

const OPTION_STYLE = [
  {
    bg: "bg-primary",
    bgLight: "bg-primary-container/15",
    text: "text-on-primary",
    textLight: "text-primary",
    ring: "ring-primary-container",
  },
  {
    bg: "bg-secondary-container",
    bgLight: "bg-secondary-container/20",
    text: "text-on-secondary-container",
    textLight: "text-secondary",
    ring: "ring-secondary-container",
  },
  {
    bg: "bg-tertiary-container",
    bgLight: "bg-tertiary-container/15",
    text: "text-on-tertiary-container",
    textLight: "text-tertiary",
    ring: "ring-tertiary-container",
  },
  {
    bg: "bg-error",
    bgLight: "bg-error-container",
    text: "text-on-error",
    textLight: "text-error",
    ring: "ring-error",
  },
];

export function Quiz({ config, isTeacher, onAnswer, onNextQuestion }: QuizProps) {
  const { currentQuestionIndex, selectedAnswer, showResult } = useGameStore();
  const { setSelectedAnswer, setShowResult, addScore, incrementStreak, resetStreak } = useGameStore();
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [revealed, setRevealed] = useState(false);
  const { play } = useSound();
  const { burst } = useConfetti();
  const lastTickRef = useRef<number>(0);

  const question = config.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= config.questions.length - 1;
  const timeLimit = question?.time_limit_seconds ?? 30;

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setRevealed(false);
    lastTickRef.current = 0;
  }, [currentQuestionIndex]);

  // Countdown ticking sound for last 3 seconds (teacher view only — too distracting on student handhelds)
  useEffect(() => {
    if (!isTeacher || revealed) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      const remaining = Math.ceil(timeLimit - elapsed);
      if (remaining <= 3 && remaining > 0 && remaining !== lastTickRef.current) {
        play("countdown-low");
        lastTickRef.current = remaining;
      }
    }, 200);
    return () => clearInterval(id);
  }, [isTeacher, revealed, questionStartTime, timeLimit, play]);

  if (!question) return null;

  function handleSelectOption(optionIndex: number) {
    if (selectedAnswer !== null || isTeacher || !question) return;

    setSelectedAnswer(optionIndex);
    setShowResult(true);

    const correct = optionIndex === question.correct_index;
    const timeTaken = Date.now() - questionStartTime;

    if (correct) {
      play("correct");
      play("ding");
      burst();
      incrementStreak();
      // Score is calculated server-side via submitScore — add a visual
      // estimate here so the header pill updates instantly.
      const timeRatio = Math.max(0, 1 - timeTaken / ((timeLimit ?? 30) * 1000));
      const visualScore = 100 + Math.round(timeRatio * 50);
      addScore(visualScore);
    } else {
      play("wrong");
      resetStreak();
      addScore(20); // Participation points
    }

    onAnswer(currentQuestionIndex, optionIndex, correct, timeTaken);
  }

  function handleRevealAnswer() {
    if (revealed || !question) return;
    setRevealed(true);
    setShowResult(true);
    play("ding");
    burst();
  }

  function handleNext() {
    play("whoosh");
    onNextQuestion?.();
  }

  // Teacher displays the answer reveal — auto reveal after time runs out OR via button
  const showAnswerHighlight = isTeacher ? revealed : showResult;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* ===== Top Bar: Progress + Timer ===== */}
      <div className="flex items-center justify-between mb-8 gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Question {currentQuestionIndex + 1} of {config.questions.length}
          </p>
          <div className="flex gap-1.5">
            {config.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i === currentQuestionIndex
                    ? "bg-primary"
                    : i < currentQuestionIndex
                      ? "bg-tertiary-container"
                      : "bg-surface-container-highest"
                }`}
              />
            ))}
          </div>
        </div>
        {isTeacher ? (
          <TimerRing
            duration={timeLimit}
            running={!revealed}
            onComplete={handleRevealAnswer}
            size={80}
          />
        ) : (
          <StudentTimer
            key={currentQuestionIndex}
            duration={timeLimit}
            running={selectedAnswer === null}
            size="md"
          />
        )}
      </div>

      {/* ===== Question ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          {/* ===== Per-question visual (context) ===== */}
          {/* When the question carries a `visual` spec the renderer
              dispatches to the right inline SVG component. Always
              decorative/representative — never reveals the answer. */}
          {question.visual && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
              className="flex items-center justify-center mb-6"
            >
              <VisualRegistry visual={question.visual} />
            </motion.div>
          )}

          <motion.h2
            initial={{ rotate: 0 }}
            animate={{ rotate: -1 }}
            className={`font-headline font-black text-on-surface text-center leading-tight origin-center ${
              question.visual
                ? "text-2xl md:text-4xl mb-8"
                : "text-4xl md:text-6xl mb-10"
            }`}
          >
            {question.question}
          </motion.h2>

          {/* ===== Options Grid ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, oi) => {
              const style = OPTION_STYLE[oi % OPTION_STYLE.length];
              const isSelected = selectedAnswer === oi;
              const isCorrect = oi === question.correct_index;

              let cardClass = `bg-surface-container-lowest ambient-shadow`;
              let letterClass = `${style.bg} ${style.text}`;
              let opacity = 1;

              if (showAnswerHighlight) {
                if (isCorrect) {
                  cardClass = "bg-tertiary-container/20 ring-4 ring-tertiary";
                  letterClass = "bg-tertiary text-on-tertiary";
                } else if (isSelected && !isCorrect) {
                  cardClass = "bg-error-container ring-4 ring-error";
                  letterClass = "bg-error text-on-error";
                } else {
                  opacity = 0.4;
                }
              } else if (isSelected) {
                cardClass = `bg-surface-container-lowest ring-4 ${style.ring} ambient-shadow-lg`;
              }

              return (
                <motion.button
                  key={oi}
                  whileTap={!showAnswerHighlight && !isTeacher ? { scale: 0.96 } : undefined}
                  whileHover={!showAnswerHighlight && !isTeacher ? { y: -4, scale: 1.01 } : undefined}
                  animate={{ opacity }}
                  onClick={() => handleSelectOption(oi)}
                  disabled={selectedAnswer !== null || isTeacher}
                  className={`
                    p-6 rounded-xl text-left transition-colors
                    flex items-center gap-4 select-none touch-manipulation
                    ${cardClass}
                    ${selectedAnswer === null && !isTeacher ? "cursor-pointer" : ""}
                  `}
                >
                  <span
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center
                      font-headline font-black text-2xl shrink-0 shadow-md
                      ${letterClass}
                    `}
                  >
                    {showAnswerHighlight && isCorrect ? (
                      <span className="material-symbols-outlined text-3xl">check</span>
                    ) : showAnswerHighlight && isSelected && !isCorrect ? (
                      <span className="material-symbols-outlined text-3xl">close</span>
                    ) : (
                      String.fromCharCode(65 + oi)
                    )}
                  </span>
                  <span className="font-body text-xl md:text-2xl font-bold text-on-surface flex-1">
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ===== Teacher Controls ===== */}
      {isTeacher && (
        <div className="flex justify-center gap-3 mt-10">
          {!revealed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRevealAnswer}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 font-headline font-black text-xl text-on-secondary-container bg-secondary-container rounded-full shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">visibility</span>
              Reveal Answer
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 font-headline font-black text-xl text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg"
            >
              {isLastQuestion ? (
                <>
                  <span className="material-symbols-outlined text-2xl">flag</span>
                  Finish Game
                </>
              ) : (
                <>
                  Next Question
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      )}

      {/* ===== Student Feedback Toast ===== */}
      <AnimatePresence>
        {!isTeacher && showResult && selectedAnswer !== null && question && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="mt-8 text-center"
          >
            {selectedAnswer === question.correct_index ? (
              <p className="font-headline font-black text-3xl text-tertiary">
                ✨ Correct! +1,000 pts ✨
              </p>
            ) : (
              <p className="font-headline font-black text-2xl text-error">
                Try the next one! 💪
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
