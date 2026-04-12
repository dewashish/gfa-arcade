"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { StudentTimer } from "@/components/games/StudentTimer";
import type { MatchUpConfig } from "@/lib/game-engine/types";

interface MatchUpProps {
  config: MatchUpConfig;
  onAnswer: (pairIndex: number, correct: boolean, timeTakenMs: number) => void;
}

/**
 * MatchUp — Phase 2 enrichment.
 *
 * Changes vs. the original:
 *  - Renders `pair.emoji` (new) and `pair.image_url` (already on type
 *    but previously unused) inside the draggable term card so Year 1
 *    readers have a visual anchor beyond the word.
 *  - Responsive grid: stacks to a single column on < md so phones/
 *    tablets don't overflow.
 *  - Drop zones pulse and scale more dramatically when hovered.
 *  - Correct matches get a scale+bounce animation as they lock in.
 *  - All-matched celebration animates in with a big spring.
 */
export function MatchUp({ config, onAnswer }: MatchUpProps) {
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const { play } = useSound();
  const { burst, fireworks } = useConfetti();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // Shuffle definitions for display
  const [shuffledDefs] = useState(() => {
    const indices = config.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const termIndex = active.id as number;
      const defIndex = over.id as number;

      if (termIndex === defIndex) {
        setMatched((prev) => new Set([...prev, termIndex]));
        play("correct");
        play("ding");
        onAnswer(termIndex, true, Date.now() - startTime);

        if (matched.size + 1 === config.pairs.length) {
          burst();
          fireworks();
          play("confetti");
          play("tada");
        }
      } else {
        setWrongPair(termIndex);
        play("wrong");
        onAnswer(termIndex, false, Date.now() - startTime);
        setTimeout(() => setWrongPair(null), 800);
      }
    },
    [config.pairs.length, matched.size, onAnswer, play, burst, fireworks, startTime]
  );

  const allMatched = matched.size === config.pairs.length;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="font-headline text-2xl md:text-4xl font-black text-primary origin-left"
          >
            Match the pairs!
          </motion.h2>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-on-surface-variant font-headline font-black text-lg md:text-xl">
              {matched.size} / {config.pairs.length}
            </span>
            {config.time_limit_seconds && (
              <StudentTimer
                duration={config.time_limit_seconds}
                running={!allMatched}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Responsive grid: single column on phones, 2 cols on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Terms (left / top) */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest font-headline font-black text-on-surface-variant mb-2">
              Drag these…
            </p>
            {config.pairs.map((pair, i) => (
              <DraggableTerm
                key={`term-${i}`}
                id={i}
                label={pair.term}
                emoji={pair.emoji}
                imageUrl={pair.image_url}
                isMatched={matched.has(i)}
                isWrong={wrongPair === i}
              />
            ))}
          </div>

          {/* Definitions (right / bottom, shuffled) */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest font-headline font-black text-on-surface-variant mb-2">
              …to match here
            </p>
            {shuffledDefs.map((origIdx) => (
              <DroppableDefinition
                key={`def-${origIdx}`}
                id={origIdx}
                label={config.pairs[origIdx].definition}
                isMatched={matched.has(origIdx)}
              />
            ))}
          </div>
        </div>

        {/* All-matched celebration */}
        <AnimatePresence>
          {allMatched && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="text-center mt-10"
            >
              <p className="font-headline text-4xl md:text-5xl font-black text-tertiary">
                🎉 All Matched! 🎉
              </p>
              <p className="font-body text-lg text-on-surface-variant mt-2">
                Amazing work!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}

function DraggableTerm({
  id,
  label,
  emoji,
  imageUrl,
  isMatched,
  isWrong,
}: {
  id: number;
  label: string;
  emoji?: string;
  imageUrl?: string;
  isMatched: boolean;
  isWrong: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isMatched,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      animate={
        isWrong
          ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
          : isMatched
            ? { scale: [1, 1.08, 1], transition: { duration: 0.4 } }
            : {}
      }
      className={`
        p-4 rounded-2xl font-body text-base cursor-grab active:cursor-grabbing
        transition-colors select-none touch-manipulation
        ${
          isMatched
            ? "bg-tertiary-container/25 text-tertiary line-through opacity-60"
            : isDragging
              ? "bg-primary-container/30 text-primary shadow-2xl scale-105 ring-4 ring-primary/30"
              : "bg-surface-container-lowest text-on-surface ambient-shadow hover:shadow-lg"
        }
        ${isWrong ? "bg-error-container text-on-error-container ring-4 ring-error/40" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-lg opacity-50 shrink-0">
          drag_indicator
        </span>
        {/* Emoji anchor (or image if supplied) */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-12 h-12 object-contain shrink-0 drop-shadow-md"
            aria-hidden="true"
          />
        ) : emoji ? (
          <motion.span
            className="text-3xl md:text-4xl shrink-0"
            animate={isDragging ? { rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.6, repeat: isDragging ? Infinity : 0 }}
            aria-hidden="true"
          >
            {emoji}
          </motion.span>
        ) : null}
        <span className="font-headline font-bold text-lg md:text-xl flex-1">{label}</span>
      </div>
    </motion.div>
  );
}

function DroppableDefinition({
  id,
  label,
  isMatched,
}: {
  id: number;
  label: string;
  isMatched: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      animate={
        isOver && !isMatched
          ? { scale: 1.04 }
          : isMatched
            ? { scale: [1, 1.05, 1] }
            : { scale: 1 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={`
        p-4 rounded-2xl font-body text-base transition-colors
        ${
          isMatched
            ? "bg-tertiary-container/25 text-tertiary ring-2 ring-tertiary/40"
            : isOver
              ? "bg-primary-container/20 ring-4 ring-primary"
              : "bg-surface-container-low text-on-surface-variant border-2 border-dashed border-outline-variant/50"
        }
      `}
    >
      <div className="flex items-center gap-2">
        {isMatched && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320 }}
            className="material-symbols-outlined text-tertiary text-2xl shrink-0"
          >
            check_circle
          </motion.span>
        )}
        <span className="font-headline font-bold text-lg flex-1">{label}</span>
      </div>
    </motion.div>
  );
}
