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
import type { MatchUpConfig } from "@/lib/game-engine/types";

interface MatchUpProps {
  config: MatchUpConfig;
  onAnswer: (pairIndex: number, correct: boolean, timeTakenMs: number) => void;
}

export function MatchUp({ config, onAnswer }: MatchUpProps) {
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const { play } = useSound();
  const { burst } = useConfetti();

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
        // Correct match!
        setMatched((prev) => new Set([...prev, termIndex]));
        play("correct");
        onAnswer(termIndex, true, Date.now() - startTime);

        if (matched.size + 1 === config.pairs.length) {
          burst();
          play("confetti");
        }
      } else {
        // Wrong match
        setWrongPair(termIndex);
        play("wrong");
        onAnswer(termIndex, false, Date.now() - startTime);
        setTimeout(() => setWrongPair(null), 800);
      }
    },
    [config.pairs.length, matched.size, onAnswer, play, burst, startTime]
  );

  const allMatched = matched.size === config.pairs.length;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="font-headline text-3xl md:text-4xl font-black text-primary origin-left"
          >
            Match the pairs!
          </motion.h2>
          <span className="text-on-surface-variant font-body font-bold text-lg">
            {matched.size} / {config.pairs.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Terms (left) */}
          <div className="space-y-3">
            <p className="text-sm font-body text-on-surface-variant mb-2 font-medium">
              Drag these...
            </p>
            {config.pairs.map((pair, i) => (
              <DraggableTerm
                key={`term-${i}`}
                id={i}
                label={pair.term}
                isMatched={matched.has(i)}
                isWrong={wrongPair === i}
              />
            ))}
          </div>

          {/* Definitions (right, shuffled) */}
          <div className="space-y-3">
            <p className="text-sm font-body text-on-surface-variant mb-2 font-medium">
              ...to match here
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

        {allMatched && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mt-8"
          >
            <p className="font-headline text-3xl font-bold text-tertiary">
              All Matched! Great Job! 🎉
            </p>
          </motion.div>
        )}
      </div>
    </DndContext>
  );
}

function DraggableTerm({
  id,
  label,
  isMatched,
  isWrong,
}: {
  id: number;
  label: string;
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
    <AnimatePresence>
      <motion.div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        animate={
          isWrong
            ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
            : {}
        }
        className={`
          p-4 rounded-xl font-body text-base cursor-grab active:cursor-grabbing
          transition-colors select-none touch-manipulation
          ${
            isMatched
              ? "bg-tertiary-container/20 text-tertiary line-through opacity-50"
              : isDragging
                ? "bg-primary-container/30 text-primary shadow-lg scale-105"
                : "bg-surface-lowest text-on-surface ambient-shadow"
          }
          ${isWrong ? "bg-error-container text-on-error-container" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg opacity-50">drag_indicator</span>
          {label}
        </div>
      </motion.div>
    </AnimatePresence>
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
    <div
      ref={setNodeRef}
      className={`
        p-4 rounded-xl font-body text-base transition-all
        ${
          isMatched
            ? "bg-tertiary-container/20 text-tertiary"
            : isOver
              ? "bg-primary-container/15 ring-2 ring-primary-container scale-[1.02]"
              : "bg-surface-low text-on-surface-variant border-2 border-dashed border-outline-variant"
        }
      `}
    >
      {isMatched && (
        <span className="material-symbols-outlined text-tertiary mr-2 align-middle">
          check_circle
        </span>
      )}
      {label}
    </div>
  );
}
