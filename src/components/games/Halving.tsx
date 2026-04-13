"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { TimerRing } from "@/components/ui/TimerRing";
import { StudentTimer } from "@/components/games/StudentTimer";
import { ShapeFractionVisual } from "@/components/games/visuals/ShapeFractionVisual";
import type { HalvingConfig, HalvingChoice } from "@/lib/game-engine/types";

interface HalvingProps {
  config: HalvingConfig;
  isTeacher: boolean;
  onAnswer: (questionIndex: number, selectedOption: number, correct: boolean, timeTakenMs: number) => void;
  onNextQuestion?: () => void;
}

const OBJECT_EMOJI: Record<string, string> = {
  apple: "🍎",
  star: "⭐",
  cookie: "🍪",
  balloon: "🎈",
  heart: "❤️",
  dot: "🔵",
};

const OPTION_COLOURS = [
  { bg: "bg-primary", text: "text-on-primary" },
  { bg: "bg-secondary-container", text: "text-on-secondary-container" },
  { bg: "bg-tertiary-container", text: "text-on-tertiary-container" },
  { bg: "bg-error", text: "text-on-error" },
];

const PATTERN_LABELS: Record<string, string> = {
  "half-v": "vertical cut",
  "half-h": "horizontal cut",
  "half-diag": "diagonal cut",
  quarter: "quarter cut",
  "uneven-2": "uneven cut",
  thirds: "three parts",
  whole: "no cut",
};

export function Halving({ config, isTeacher, onAnswer, onNextQuestion }: HalvingProps) {
  const { currentQuestionIndex, selectedAnswer, showResult } = useGameStore();
  const { setSelectedAnswer, setShowResult, addScore, incrementStreak, resetStreak } = useGameStore();
  const startTimeRef = useRef(Date.now());
  const prevQuestionRef = useRef(currentQuestionIndex);
  const [revealed, setRevealed] = useState(false);
  const { play } = useSound();
  const { burst } = useConfetti();

  // Tap-to-split state
  const [selectedObjects, setSelectedObjects] = useState<Set<number>>(new Set());
  const [splitSubmitted, setSplitSubmitted] = useState(false);

  // Multi-select state
  const [multiSelections, setMultiSelections] = useState<Set<number>>(new Set());
  const [multiSubmitted, setMultiSubmitted] = useState(false);

  const question = config.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= config.questions.length - 1;
  const timeLimit = question?.time_limit_seconds ?? 20;

  // Reset state when question advances
  useEffect(() => {
    if (currentQuestionIndex !== prevQuestionRef.current) {
      startTimeRef.current = Date.now();
      prevQuestionRef.current = currentQuestionIndex;
      setRevealed(false);
      setSelectedObjects(new Set());
      setSplitSubmitted(false);
      setMultiSelections(new Set());
      setMultiSubmitted(false);
    }
  }, [currentQuestionIndex]);

  // Shuffle options for find-half mode
  const shuffledOptions = useMemo(() => {
    if (!question || question.mode !== "find-half" || !question.options) return [];
    const indices = question.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, config]);

  if (!question) return null;

  const emoji = OBJECT_EMOJI[question.object ?? "star"] ?? "⭐";
  const half = question.total ? Math.floor(question.total / 2) : 0;

  // ===== Shared scoring helper =====
  function scoreAndReport(correct: boolean, answerValue: number) {
    const timeTaken = Date.now() - startTimeRef.current;
    setSelectedAnswer(answerValue);
    setShowResult(true);

    if (correct) {
      play("correct");
      play("ding");
      burst();
      incrementStreak();
      const timeRatio = Math.max(0, 1 - timeTaken / (timeLimit * 1000));
      addScore(100 + Math.round(timeRatio * 50));
    } else {
      play("wrong");
      resetStreak();
      addScore(20);
    }

    onAnswer(currentQuestionIndex, answerValue, correct, timeTaken);
  }

  // ===== Handlers =====

  function handleTapObject(index: number) {
    if (splitSubmitted || selectedAnswer !== null || isTeacher) return;
    setSelectedObjects((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      play("pop");
      return next;
    });
  }

  function handleSubmitSplit() {
    if (splitSubmitted || selectedAnswer !== null || isTeacher) return;
    setSplitSubmitted(true);
    scoreAndReport(selectedObjects.size === question.correctAnswer, selectedObjects.size);
  }

  function handleFindHalfSelect(displayPos: number) {
    if (selectedAnswer !== null || isTeacher || !question.options) return;
    const origIdx = shuffledOptions[displayPos];
    const value = question.options[origIdx];
    scoreAndReport(value === question.correctAnswer, origIdx);
  }

  function handleTrueFalse(answer: boolean) {
    if (selectedAnswer !== null || isTeacher) return;
    scoreAndReport(answer === !!question.isCorrectSplit, answer ? 1 : 0);
  }

  function handleShapeHalf(answer: boolean) {
    if (selectedAnswer !== null || isTeacher) return;
    scoreAndReport(answer === !!question.isCorrectSplit, answer ? 1 : 0);
  }

  function handleMultiToggle(index: number) {
    if (multiSubmitted || selectedAnswer !== null || isTeacher) return;
    setMultiSelections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      play("pop");
      return next;
    });
  }

  function handleMultiSubmit() {
    if (multiSubmitted || selectedAnswer !== null || isTeacher || !question.choices) return;
    setMultiSubmitted(true);

    // Correct if student selected exactly the right set
    const correctSet = new Set(
      question.choices.map((c, i) => (c.isCorrect ? i : -1)).filter((i) => i >= 0)
    );
    const isCorrect =
      multiSelections.size === correctSet.size &&
      [...multiSelections].every((i) => correctSet.has(i));

    scoreAndReport(isCorrect, multiSelections.size);
  }

  function handleRevealAnswer() {
    if (revealed) return;
    setRevealed(true);
    setShowResult(true);
    play("ding");
    burst();
  }

  function handleNext() {
    play("whoosh");
    onNextQuestion?.();
  }

  const showAnswerHighlight = isTeacher ? revealed : showResult;
  const isAnswered = selectedAnswer !== null || splitSubmitted || multiSubmitted;

  // Mode label + icon
  const modeConfig: Record<string, { label: string; icon: string }> = {
    "tap-to-split": { label: "Tap to select half!", icon: "touch_app" },
    "find-half": { label: "What is half?", icon: "calculate" },
    "true-false": { label: "True or False?", icon: "help" },
    "shape-half": { label: "Is this shape halved?", icon: "content_cut" },
    "multi-select": { label: "Pick all the halves!", icon: "checklist" },
  };
  const { label: modeLabel, icon: modeIcon } = modeConfig[question.mode] ?? {
    label: "Answer!",
    icon: "help",
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* ===== Top Bar: Progress + Timer ===== */}
      <div className="flex items-center justify-between mb-6 gap-6">
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
            running={!isAnswered}
            size="md"
          />
        )}
      </div>

      {/* ===== Question Area ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          {/* Mode badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/20 text-primary font-headline font-bold text-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">{modeIcon}</span>
              {modeLabel}
            </span>
          </div>

          {/* Hint */}
          {question.hint && (
            <p className="text-center text-on-surface-variant font-body text-sm mb-3">
              {question.hint}
            </p>
          )}

          {/* ===== TAP-TO-SPLIT ===== */}
          {question.mode === "tap-to-split" && question.total && (
            <TapToSplit
              total={question.total}
              emoji={emoji}
              selected={selectedObjects}
              onTap={handleTapObject}
              submitted={splitSubmitted || isTeacher}
              showResult={showAnswerHighlight}
              correctHalf={half}
              isTeacher={isTeacher}
              onSubmit={handleSubmitSplit}
            />
          )}

          {/* ===== FIND-HALF ===== */}
          {question.mode === "find-half" && question.options && question.total && (
            <FindHalf
              total={question.total}
              emoji={emoji}
              options={question.options}
              shuffledOrder={shuffledOptions}
              selectedAnswer={selectedAnswer}
              correctAnswer={question.correctAnswer}
              showResult={showAnswerHighlight}
              isTeacher={isTeacher}
              onSelect={handleFindHalfSelect}
            />
          )}

          {/* ===== TRUE-FALSE (objects) ===== */}
          {question.mode === "true-false" && (
            <TrueFalseMode
              leftGroup={question.leftGroup ?? 0}
              rightGroup={question.rightGroup ?? 0}
              emoji={emoji}
              isCorrectSplit={!!question.isCorrectSplit}
              selectedAnswer={selectedAnswer}
              showResult={showAnswerHighlight}
              isTeacher={isTeacher}
              onSelect={handleTrueFalse}
            />
          )}

          {/* ===== SHAPE-HALF (True/False on shapes) ===== */}
          {question.mode === "shape-half" && question.shape && question.pattern && (
            <ShapeHalfMode
              shape={question.shape}
              pattern={question.pattern}
              perspective3d={question.perspective3d}
              isCorrectSplit={!!question.isCorrectSplit}
              selectedAnswer={selectedAnswer}
              showResult={showAnswerHighlight}
              isTeacher={isTeacher}
              onSelect={handleShapeHalf}
            />
          )}

          {/* ===== MULTI-SELECT ===== */}
          {question.mode === "multi-select" && question.choices && (
            <MultiSelectMode
              prompt={question.prompt ?? "Which of these show half correctly?"}
              choices={question.choices}
              selections={multiSelections}
              onToggle={handleMultiToggle}
              submitted={multiSubmitted || isTeacher}
              showResult={showAnswerHighlight}
              isTeacher={isTeacher}
              onSubmit={handleMultiSubmit}
            />
          )}

          {/* ===== Result feedback ===== */}
          <AnimatePresence>
            {showResult && !isTeacher && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-center"
              >
                {isCorrectAnswer(question, selectedAnswer, selectedObjects, multiSelections) ? (
                  <p className="font-headline font-black text-2xl text-primary">+100 pts</p>
                ) : (
                  <div>
                    <p className="font-headline font-bold text-lg text-error mb-1">Not quite!</p>
                    <p className="text-on-surface-variant font-body text-sm">
                      {question.total
                        ? `Half of ${question.total} is ${half}. `
                        : question.shape
                          ? `This shape is ${question.isCorrectSplit ? "" : "not "}halved correctly. `
                          : ""}
                      +20 pts for trying!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Teacher controls */}
          {isTeacher && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {!revealed && (
                <button
                  onClick={handleRevealAnswer}
                  className="bg-primary text-on-primary font-headline font-bold px-8 py-3 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
                >
                  Reveal Answer
                </button>
              )}
              {revealed && (
                <button
                  onClick={handleNext}
                  className="bg-tertiary-container text-on-tertiary-container font-headline font-bold px-8 py-3 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
                >
                  {isLastQuestion ? "End Game" : "Next Question"}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Check correctness for the result feedback panel. */
function isCorrectAnswer(
  question: HalvingConfig["questions"][number],
  selectedAnswer: number | null,
  selectedObjects: Set<number>,
  multiSelections: Set<number>,
): boolean {
  switch (question.mode) {
    case "tap-to-split":
      return selectedObjects.size === question.correctAnswer;
    case "find-half":
      return question.options?.[selectedAnswer ?? -1] === question.correctAnswer;
    case "true-false":
    case "shape-half":
      return (selectedAnswer === 1) === !!question.isCorrectSplit;
    case "multi-select": {
      if (!question.choices) return false;
      const correctSet = new Set(
        question.choices.map((c, i) => (c.isCorrect ? i : -1)).filter((i) => i >= 0)
      );
      return (
        multiSelections.size === correctSet.size &&
        [...multiSelections].every((i) => correctSet.has(i))
      );
    }
    default:
      return false;
  }
}

// =====================================================================
// TAP-TO-SPLIT
// =====================================================================

function TapToSplit({
  total,
  emoji,
  selected,
  onTap,
  submitted,
  showResult,
  correctHalf,
  isTeacher,
  onSubmit,
}: {
  total: number;
  emoji: string;
  selected: Set<number>;
  onTap: (i: number) => void;
  submitted: boolean;
  showResult: boolean;
  correctHalf: number;
  isTeacher: boolean;
  onSubmit: () => void;
}) {
  const cols = total <= 6 ? total : total <= 12 ? Math.ceil(total / 2) : Math.ceil(total / 3);

  return (
    <div className="text-center">
      <h2 className="font-headline font-black text-2xl md:text-4xl text-on-surface mb-2">
        Here are {total} objects. Tap exactly half!
      </h2>
      <p className="text-on-surface-variant font-body text-sm mb-6">
        Selected: <span className="font-bold text-primary">{selected.size}</span> of {total}
        {selected.size === correctHalf && !submitted && (
          <span className="ml-2 text-primary font-bold">&mdash; that looks right!</span>
        )}
      </p>

      <div
        className="inline-grid gap-3 mb-6"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => {
          const isSelected = selected.has(i);
          const isCorrectlySelected = showResult && i < correctHalf;

          return (
            <motion.button
              key={i}
              onClick={() => onTap(i)}
              disabled={submitted || isTeacher}
              whileTap={!submitted ? { scale: 0.85 } : undefined}
              animate={
                showResult
                  ? { x: isCorrectlySelected ? -20 : 20, opacity: 1 }
                  : { x: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: showResult ? i * 0.03 : 0 }}
              className={`
                w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl
                transition-all duration-200 select-none
                ${isSelected ? "bg-primary-container ring-3 ring-primary shadow-lg scale-110" : "bg-surface-container-lowest ambient-shadow hover:bg-surface-container"}
                ${submitted ? "cursor-default" : "cursor-pointer active:scale-90"}
                ${showResult && isCorrectlySelected ? "ring-3 ring-tertiary bg-tertiary-container/30" : ""}
              `}
              aria-label={`Object ${i + 1}${isSelected ? " (selected)" : ""}`}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>

      {!isTeacher && !submitted && (
        <motion.button
          onClick={onSubmit}
          disabled={selected.size === 0}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-8 py-3 rounded-2xl font-headline font-bold text-lg shadow-md transition-all duration-200 ${
            selected.size === 0
              ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
              : "bg-primary text-on-primary hover:shadow-xl"
          }`}
        >
          Check my answer!
        </motion.button>
      )}

      {isTeacher && showResult && (
        <p className="text-on-surface-variant font-body mt-4">
          Correct: select <span className="font-bold text-primary">{correctHalf}</span> objects (half of {total})
        </p>
      )}
    </div>
  );
}

// =====================================================================
// FIND-HALF (multiple choice with visual objects)
// =====================================================================

function FindHalf({
  total,
  emoji,
  options,
  shuffledOrder,
  selectedAnswer,
  correctAnswer,
  showResult,
  isTeacher,
  onSelect,
}: {
  total: number;
  emoji: string;
  options: number[];
  shuffledOrder: number[];
  selectedAnswer: number | null;
  correctAnswer: number;
  showResult: boolean;
  isTeacher: boolean;
  onSelect: (displayPos: number) => void;
}) {
  const cols = total <= 8 ? total : Math.ceil(total / 2);

  return (
    <div className="text-center">
      <div
        className="inline-grid gap-2 mb-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 20 }}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <h2 className="font-headline font-black text-3xl md:text-5xl text-on-surface mb-8">
        What is half of {total}?
      </h2>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {shuffledOrder.map((origIdx, displayPos) => {
          const value = options[origIdx];
          const style = OPTION_COLOURS[displayPos % OPTION_COLOURS.length];
          const isSelected = selectedAnswer === origIdx;
          const isCorrect = value === correctAnswer;

          let cardClass = "bg-surface-container-lowest ambient-shadow";
          let opacity = 1;

          if (showResult) {
            if (isCorrect) cardClass = "bg-tertiary-container ring-3 ring-tertiary";
            else if (isSelected && !isCorrect) {
              cardClass = "bg-error-container ring-3 ring-error";
              opacity = 0.7;
            } else opacity = 0.4;
          }

          return (
            <motion.button
              key={origIdx}
              onClick={() => onSelect(displayPos)}
              disabled={selectedAnswer !== null || isTeacher}
              whileTap={selectedAnswer === null ? { scale: 0.92 } : undefined}
              animate={{ opacity }}
              className={`${cardClass} rounded-2xl p-5 flex items-center gap-3 transition-all hover:translate-y-[-2px] ${
                selectedAnswer !== null || isTeacher ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.text} flex items-center justify-center font-headline font-black text-lg`}>
                {String.fromCharCode(65 + displayPos)}
              </div>
              <span className="font-headline font-black text-2xl text-on-surface">{value}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// TRUE-FALSE (objects)
// =====================================================================

function TrueFalseMode({
  leftGroup,
  rightGroup,
  emoji,
  isCorrectSplit,
  selectedAnswer,
  showResult,
  isTeacher,
  onSelect,
}: {
  leftGroup: number;
  rightGroup: number;
  emoji: string;
  isCorrectSplit: boolean;
  selectedAnswer: number | null;
  showResult: boolean;
  isTeacher: boolean;
  onSelect: (answer: boolean) => void;
}) {
  const total = leftGroup + rightGroup;

  return (
    <div className="text-center">
      <h2 className="font-headline font-black text-2xl md:text-4xl text-on-surface mb-6">
        {total} objects split into two groups.
        <br />
        <span className="text-primary">Is this halved correctly?</span>
      </h2>

      <div className="flex items-center justify-center gap-6 md:gap-10 mb-8">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-surface-container-lowest rounded-3xl p-4 md:p-6 ambient-shadow min-w-[120px]"
        >
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {Array.from({ length: leftGroup }, (_, i) => (
              <span key={i} className="text-2xl md:text-3xl">{emoji}</span>
            ))}
          </div>
          <p className="font-headline font-black text-xl text-on-surface">{leftGroup}</p>
        </motion.div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-12 bg-outline-variant rounded-full" />
          <span className="material-symbols-outlined text-outline-variant text-2xl">compare_arrows</span>
          <div className="w-0.5 h-12 bg-outline-variant rounded-full" />
        </div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-surface-container-lowest rounded-3xl p-4 md:p-6 ambient-shadow min-w-[120px]"
        >
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {Array.from({ length: rightGroup }, (_, i) => (
              <span key={i} className="text-2xl md:text-3xl">{emoji}</span>
            ))}
          </div>
          <p className="font-headline font-black text-xl text-on-surface">{rightGroup}</p>
        </motion.div>
      </div>

      <TrueFalseButtons
        isCorrectSplit={isCorrectSplit}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        isTeacher={isTeacher}
        onSelect={onSelect}
      />

      {isTeacher && showResult && (
        <p className="text-on-surface-variant font-body mt-6">
          {isCorrectSplit
            ? `True — both groups have ${leftGroup} objects (equal halves).`
            : `False — the groups are ${leftGroup} and ${rightGroup}, not equal.`}
        </p>
      )}
    </div>
  );
}

// =====================================================================
// SHAPE-HALF (True/False on shape visuals)
// =====================================================================

function ShapeHalfMode({
  shape,
  pattern,
  perspective3d,
  isCorrectSplit,
  selectedAnswer,
  showResult,
  isTeacher,
  onSelect,
}: {
  shape: string;
  pattern: string;
  perspective3d?: boolean;
  isCorrectSplit: boolean;
  selectedAnswer: number | null;
  showResult: boolean;
  isTeacher: boolean;
  onSelect: (answer: boolean) => void;
}) {
  const shapeName = shape.charAt(0).toUpperCase() + shape.slice(1);
  const patternName = PATTERN_LABELS[pattern] ?? pattern;

  return (
    <div className="text-center">
      <h2 className="font-headline font-black text-2xl md:text-4xl text-on-surface mb-6">
        Look at this {shapeName.toLowerCase()}.
        <br />
        <span className="text-primary">Is it cut exactly in half?</span>
      </h2>

      {/* Shape visual — centred with optional 3D perspective */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex justify-center mb-8"
        style={
          perspective3d
            ? { perspective: "600px", transformStyle: "preserve-3d" }
            : undefined
        }
      >
        <div
          style={
            perspective3d
              ? { transform: "rotateY(-12deg) rotateX(8deg)", transformStyle: "preserve-3d" }
              : undefined
          }
        >
          <ShapeFractionVisual
            shape={shape as "circle" | "square" | "rectangle" | "pizza" | "chocolate"}
            pattern={pattern as "whole" | "half-v" | "half-h" | "half-diag" | "quarter" | "uneven-2" | "thirds"}
            size={180}
          />
        </div>
      </motion.div>

      {/* Label showing the cut type (no answer revealed — just describes visually) */}
      <p className="text-on-surface-variant font-body text-xs uppercase tracking-widest mb-6">
        {shapeName} with {patternName}
      </p>

      <TrueFalseButtons
        isCorrectSplit={isCorrectSplit}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        isTeacher={isTeacher}
        onSelect={onSelect}
      />

      {isTeacher && showResult && (
        <p className="text-on-surface-variant font-body mt-6">
          {isCorrectSplit
            ? `True — this ${shapeName.toLowerCase()} is split into 2 equal halves.`
            : `False — the pieces are not equal. This is a ${patternName}, not a half.`}
        </p>
      )}
    </div>
  );
}

// =====================================================================
// MULTI-SELECT (pick all correct)
// =====================================================================

function MultiSelectMode({
  prompt,
  choices,
  selections,
  onToggle,
  submitted,
  showResult,
  isTeacher,
  onSubmit,
}: {
  prompt: string;
  choices: HalvingChoice[];
  selections: Set<number>;
  onToggle: (i: number) => void;
  submitted: boolean;
  showResult: boolean;
  isTeacher: boolean;
  onSubmit: () => void;
}) {
  const correctCount = choices.filter((c) => c.isCorrect).length;

  return (
    <div className="text-center">
      <h2 className="font-headline font-black text-2xl md:text-4xl text-on-surface mb-2">
        {prompt}
      </h2>
      <p className="text-on-surface-variant font-body text-sm mb-6">
        Tap all correct answers, then submit. ({correctCount} correct)
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-6">
        {choices.map((choice, i) => {
          const isSelected = selections.has(i);
          const isCorrect = choice.isCorrect;

          let cardClass = isSelected
            ? "bg-primary-container ring-3 ring-primary"
            : "bg-surface-container-lowest ambient-shadow";
          let opacity = 1;

          if (showResult) {
            if (isCorrect) {
              cardClass = "bg-tertiary-container ring-3 ring-tertiary";
            } else if (isSelected && !isCorrect) {
              cardClass = "bg-error-container ring-3 ring-error";
              opacity = 0.7;
            } else {
              opacity = 0.5;
            }
          }

          return (
            <motion.button
              key={i}
              onClick={() => onToggle(i)}
              disabled={submitted || isTeacher}
              animate={{ opacity }}
              whileTap={!submitted ? { scale: 0.93 } : undefined}
              className={`${cardClass} rounded-2xl p-4 flex flex-col items-center gap-3 transition-all ${
                submitted || isTeacher ? "cursor-default" : "cursor-pointer hover:translate-y-[-2px]"
              }`}
            >
              {/* Visual: shape or object split */}
              {choice.shape && choice.pattern && (
                <ShapeFractionVisual
                  shape={choice.shape}
                  pattern={choice.pattern}
                  compact
                  size={100}
                />
              )}
              {choice.objectEmoji && choice.objectTotal && (
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap justify-center gap-1">
                    {Array.from({ length: choice.objectSplitLeft ?? 0 }, (_, j) => (
                      <span key={`l${j}`} className="text-lg">{choice.objectEmoji}</span>
                    ))}
                  </div>
                  <div className="w-px h-8 bg-outline-variant" />
                  <div className="flex flex-wrap justify-center gap-1">
                    {Array.from({ length: choice.objectSplitRight ?? 0 }, (_, j) => (
                      <span key={`r${j}`} className="text-lg">{choice.objectEmoji}</span>
                    ))}
                  </div>
                </div>
              )}
              <span className="font-headline font-bold text-sm text-on-surface">{choice.label}</span>

              {/* Selection indicator */}
              {!showResult && (
                <span className={`material-symbols-outlined text-lg ${isSelected ? "text-primary" : "text-outline-variant"}`}>
                  {isSelected ? "check_circle" : "radio_button_unchecked"}
                </span>
              )}
              {showResult && (
                <span className={`material-symbols-outlined text-lg ${isCorrect ? "text-tertiary" : "text-error"}`}>
                  {isCorrect ? "check_circle" : "cancel"}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {!isTeacher && !submitted && (
        <motion.button
          onClick={onSubmit}
          disabled={selections.size === 0}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-8 py-3 rounded-2xl font-headline font-bold text-lg shadow-md transition-all ${
            selections.size === 0
              ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
              : "bg-primary text-on-primary hover:shadow-xl"
          }`}
        >
          Check my answers!
        </motion.button>
      )}
    </div>
  );
}

// =====================================================================
// SHARED: True / False buttons
// =====================================================================

function TrueFalseButtons({
  isCorrectSplit,
  selectedAnswer,
  showResult,
  isTeacher,
  onSelect,
}: {
  isCorrectSplit: boolean;
  selectedAnswer: number | null;
  showResult: boolean;
  isTeacher: boolean;
  onSelect: (answer: boolean) => void;
}) {
  return (
    <div className="flex justify-center gap-6">
      {[
        { label: "True", value: true, icon: "check_circle", colour: "bg-tertiary-container text-on-tertiary-container" },
        { label: "False", value: false, icon: "cancel", colour: "bg-error-container text-on-error-container" },
      ].map((btn) => {
        const isSelected = selectedAnswer === (btn.value ? 1 : 0);
        const isCorrect = btn.value === isCorrectSplit;

        let cardClass = `${btn.colour} ambient-shadow`;
        let opacity = 1;

        if (showResult) {
          if (isCorrect) cardClass = "bg-tertiary-container ring-3 ring-tertiary text-on-tertiary-container";
          else if (isSelected && !isCorrect) {
            cardClass = "bg-error-container ring-3 ring-error text-on-error-container";
            opacity = 0.7;
          } else opacity = 0.4;
        }

        return (
          <motion.button
            key={btn.label}
            onClick={() => onSelect(btn.value)}
            disabled={selectedAnswer !== null || isTeacher}
            whileTap={selectedAnswer === null ? { scale: 0.9 } : undefined}
            animate={{ opacity }}
            className={`${cardClass} rounded-2xl px-8 py-4 flex items-center gap-3 font-headline font-black text-xl transition-all hover:translate-y-[-2px] ${
              selectedAnswer !== null || isTeacher ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{btn.icon}</span>
            {btn.label}
          </motion.button>
        );
      })}
    </div>
  );
}
