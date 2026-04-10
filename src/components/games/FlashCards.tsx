"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/Button";
import type { FlashCardsConfig } from "@/lib/game-engine/types";

interface FlashCardsProps {
  config: FlashCardsConfig;
}

export function FlashCards({ config }: FlashCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const { play } = useSound();

  const card = config.cards[currentIndex];
  if (!card) return null;

  function handleFlip() {
    play("page-turn");
    setIsFlipped(!isFlipped);
  }

  function handleNext() {
    play("whoosh");
    setIsFlipped(false);
    if (currentIndex < config.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCompleted(completed + 1);
    }
  }

  function handlePrev() {
    play("whoosh");
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  }

  const allDone = completed >= config.cards.length;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-on-surface-variant font-body">
          Card {currentIndex + 1} of {config.cards.length}
        </span>
        <span className="text-sm text-on-surface-variant font-body">
          Tap card to flip!
        </span>
      </div>

      {/* Card */}
      <div className="w-full" style={{ perspective: 1000 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${isFlipped}`}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.4 }}
            onClick={handleFlip}
            className={`
              w-full min-h-[300px] rounded-3xl flex flex-col items-center justify-center p-8
              cursor-pointer select-none touch-manipulation
              ${isFlipped
                ? "bg-tertiary-container/20 border-2 border-tertiary-container"
                : "bg-surface-lowest ambient-shadow-lg"
              }
            `}
          >
            <p className="text-sm text-on-surface-variant font-body mb-2">
              {isFlipped ? "Answer" : "Question"}
            </p>
            <p className="font-headline text-2xl md:text-3xl font-bold text-on-surface text-center leading-relaxed">
              {isFlipped ? card.back : card.front}
            </p>
            <p className="text-sm text-on-surface-variant font-body mt-4">
              {isFlipped ? "Tap to see question" : "Tap to reveal answer"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full">
        <Button
          variant="ghost"
          size="md"
          icon="arrow_back"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="md"
          icon="arrow_forward"
          onClick={handleNext}
          disabled={currentIndex >= config.cards.length - 1}
          fullWidth
        >
          Next Card
        </Button>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {config.cards.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-primary"
                : i < currentIndex
                  ? "bg-tertiary-container"
                  : "bg-surface-highest"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
