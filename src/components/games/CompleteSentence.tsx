"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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
import type { CompleteSentenceConfig } from "@/lib/game-engine/types";

interface CompleteSentenceProps {
  config: CompleteSentenceConfig;
  onAnswer: (sentenceIndex: number, correct: boolean, timeTakenMs: number) => void;
}

export function CompleteSentence({ config, onAnswer }: CompleteSentenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [startTime] = useState(Date.now());
  const { play } = useSound();
  const { burst } = useConfetti();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const sentence = config.sentences[currentIndex];
  if (!sentence) return null;

  // Build word bank: correct answers + distractors, shuffled
  const allWords = sentence.blanks.flatMap((b) => [b.answer, ...b.distractors]);
  const [shuffledWords] = useState(() => {
    const words = [...allWords];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  });

  // Split sentence text into parts around blanks
  const parts = sentence.text.split(/___/g);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const word = active.id as string;
      const blankIndex = over.id as number;

      const blank = sentence.blanks[blankIndex];
      if (!blank) return;

      const isCorrect = word.toLowerCase() === blank.answer.toLowerCase();

      if (isCorrect) {
        setFilledBlanks((prev) => ({ ...prev, [blankIndex]: word }));
        play("correct");

        // Check if all blanks filled
        const newFilled = { ...filledBlanks, [blankIndex]: word };
        if (Object.keys(newFilled).length === sentence.blanks.length) {
          burst();
          onAnswer(currentIndex, true, Date.now() - startTime);
        }
      } else {
        play("wrong");
        onAnswer(currentIndex, false, Date.now() - startTime);
      }
    },
    [sentence, filledBlanks, currentIndex, onAnswer, play, burst, startTime]
  );

  const usedWords = new Set(Object.values(filledBlanks));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="font-headline text-3xl md:text-4xl font-black text-primary origin-left"
          >
            Complete the sentence!
          </motion.h2>
          <span className="text-on-surface-variant font-body font-bold text-lg">
            {currentIndex + 1} / {config.sentences.length}
          </span>
        </div>

        {/* Sentence with blanks */}
        <div className="bg-surface-lowest rounded-2xl p-6 ambient-shadow mb-6">
          <p className="font-body text-xl leading-loose text-on-surface flex flex-wrap items-center gap-1">
            {parts.map((part, i) => (
              <span key={`part-${i}`}>
                {part}
                {i < parts.length - 1 && (
                  <BlankDropZone
                    id={i}
                    filledWord={filledBlanks[i]}
                  />
                )}
              </span>
            ))}
          </p>
        </div>

        {/* Word bank */}
        <div className="bg-surface-low rounded-2xl p-4">
          <p className="text-sm text-on-surface-variant font-body mb-3 font-medium">
            Drag words to fill the blanks:
          </p>
          <div className="flex flex-wrap gap-3">
            {shuffledWords.map((word) => (
              <DraggableWord
                key={word}
                word={word}
                isUsed={usedWords.has(word)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

function DraggableWord({ word, isUsed }: { word: string; isUsed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: word,
    disabled: isUsed,
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
      className={`
        px-4 py-2 rounded-xl font-body text-base font-medium
        cursor-grab active:cursor-grabbing select-none touch-manipulation
        transition-all
        ${isUsed
          ? "bg-tertiary-container/20 text-tertiary line-through opacity-40"
          : isDragging
            ? "bg-primary-container text-on-primary-container shadow-lg scale-110"
            : "bg-surface-lowest text-on-surface ambient-shadow hover:scale-105"
        }
      `}
    >
      {word}
    </motion.div>
  );
}

function BlankDropZone({ id, filledWord }: { id: number; filledWord?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  if (filledWord) {
    return (
      <span className="inline-flex items-center mx-1 px-3 py-1 rounded-lg bg-tertiary-container/20 text-tertiary font-bold">
        {filledWord}
        <span className="material-symbols-outlined text-sm ml-1">check</span>
      </span>
    );
  }

  return (
    <span
      ref={setNodeRef}
      className={`
        inline-flex items-center mx-1 px-6 py-1 rounded-lg border-2 border-dashed
        min-w-[80px] justify-center transition-all
        ${isOver
          ? "border-primary bg-primary-container/10 scale-105"
          : "border-outline-variant bg-surface-container"
        }
      `}
    >
      <span className="text-outline-variant text-sm">————</span>
    </span>
  );
}
