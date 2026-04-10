"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/Button";
import type { SpeakingCardsConfig } from "@/lib/game-engine/types";

interface SpeakingCardsProps {
  config: SpeakingCardsConfig;
}

export function SpeakingCards({ config }: SpeakingCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = deck not started
  const [isDealing, setIsDealing] = useState(false);
  const { play } = useSound();

  // Shuffled order
  const [shuffledIndices] = useState(() => {
    const indices = config.cards.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const cardsDealt = currentIndex + 1;
  const totalCards = config.cards.length;
  const currentCard = currentIndex >= 0 ? config.cards[shuffledIndices[currentIndex]] : null;

  function dealNext() {
    if (currentIndex >= totalCards - 1) return;
    setIsDealing(true);
    play("whoosh");
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsDealing(false);
    }, 200);
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-on-surface-variant font-body">
          {cardsDealt} of {totalCards} cards dealt
        </span>
        <span className="text-sm text-on-surface-variant font-body">
          {totalCards - cardsDealt} remaining
        </span>
      </div>

      {/* Card deck visual */}
      <div className="relative w-full min-h-[320px] flex items-center justify-center">
        {/* Deck stack (behind) */}
        {totalCards - cardsDealt > 0 && (
          <>
            <div className="absolute w-[90%] h-[280px] rounded-3xl bg-surface-high top-4 left-[5%]" />
            <div className="absolute w-[94%] h-[285px] rounded-3xl bg-surface-container top-2 left-[3%]" />
          </>
        )}

        {/* Current card */}
        <AnimatePresence mode="wait">
          {currentCard ? (
            <motion.div
              key={currentIndex}
              initial={{ x: 100, rotate: 10, opacity: 0 }}
              animate={{ x: 0, rotate: 0, opacity: 1 }}
              exit={{ x: -200, rotate: -15, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full min-h-[300px] rounded-3xl bg-surface-lowest ambient-shadow-lg flex flex-col items-center justify-center p-8 z-10"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-4">
                record_voice_over
              </span>
              <p className="font-headline text-2xl md:text-3xl font-bold text-on-surface text-center leading-relaxed">
                {currentCard.prompt}
              </p>
              <p className="text-sm text-on-surface-variant font-body mt-4">
                Read this aloud!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full min-h-[300px] rounded-3xl bg-primary-container/10 flex flex-col items-center justify-center p-8 z-10"
            >
              <span className="material-symbols-outlined text-5xl text-primary mb-4">
                style
              </span>
              <p className="font-headline text-xl font-bold text-on-surface">
                {totalCards} cards in the deck
              </p>
              <p className="text-on-surface-variant font-body mt-2">
                Tap "Deal Card" to start!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Deal button */}
      <Button
        variant="secondary"
        size="xl"
        icon="front_hand"
        onClick={dealNext}
        disabled={isDealing || cardsDealt >= totalCards}
        fullWidth
      >
        {cardsDealt >= totalCards
          ? "All Cards Dealt!"
          : cardsDealt === 0
            ? "Deal First Card"
            : "Deal Next Card"}
      </Button>
    </div>
  );
}
