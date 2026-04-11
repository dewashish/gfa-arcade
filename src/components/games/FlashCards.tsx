"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { Button } from "@/components/ui/Button";
import type { FlashCardsConfig } from "@/lib/game-engine/types";

interface FlashCardsProps {
  config: FlashCardsConfig;
}

/**
 * FlashCards — Phase 2 enrichment.
 *
 * Changes vs. the original:
 *  - Real 3D flip: uses `transformStyle: preserve-3d` with two
 *    positioned faces (front + back) instead of swapping content and
 *    re-mounting on flip. The card now physically rotates.
 *  - Stack depth: two ghost cards sit behind the active card at a
 *    slight offset + scale so the student feels they're working
 *    through a deck, not a single card.
 *  - Per-card `emoji` (new type field) and `image_url` (already on
 *    type, previously unused) render as a big visual anchor above
 *    the question text.
 *  - Completion celebration: when the student hits the last card,
 *    a spring banner + confetti burst replaces the "Next" button.
 *  - Entrance animation per card: each new card scales in from the
 *    deck position with a spring.
 *
 *  Respects prefers-reduced-motion via the existing
 *  ReducedMotionProvider.
 */
export function FlashCards({ config }: FlashCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { play } = useSound();
  const { burst, fireworks } = useConfetti();

  const card = config.cards[currentIndex];
  const isLast = currentIndex >= config.cards.length - 1;

  // Celebrate when the user finishes the last card (marks complete).
  useEffect(() => {
    if (completed) {
      fireworks();
      play("tada");
      play("applause");
    }
  }, [completed, fireworks, play]);

  if (!card) return null;

  function handleFlip() {
    play("page-turn");
    setIsFlipped((v) => !v);
  }

  function handleNext() {
    play("whoosh");
    if (currentIndex < config.cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      burst();
      setCompleted(true);
    }
  }

  function handlePrev() {
    play("whoosh");
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs uppercase tracking-widest font-headline font-black text-on-surface-variant">
          Card {currentIndex + 1} of {config.cards.length}
        </span>
        <span className="text-xs font-body text-on-surface-variant">
          Tap to flip!
        </span>
      </div>

      {/* Card + stack wrapper. Perspective on the parent so the 3D
          flip looks right regardless of viewport size. */}
      <div
        className="relative w-full"
        style={{ perspective: 1400, minHeight: 380 }}
      >
        {/* Ghost cards behind — give the deck depth. Only visible while
            there are more cards after the current one. */}
        {currentIndex < config.cards.length - 1 && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[32px] bg-surface-container-low shadow-[0_10px_30px_rgba(0,98,158,0.12)]"
              style={{ transform: "translate(14px, 14px) scale(0.96)", zIndex: 0 }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[32px] bg-surface-container-lowest shadow-[0_16px_40px_rgba(0,98,158,0.14)]"
              style={{ transform: "translate(7px, 7px) scale(0.98)", zIndex: 1 }}
            />
          </>
        )}

        {/* Active card — real 3D flip (preserve-3d, two absolutely-
            positioned faces, backface-visibility hides the back). */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="relative"
            style={{ zIndex: 2 }}
          >
            <motion.div
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-full cursor-pointer select-none touch-manipulation"
              style={{
                transformStyle: "preserve-3d",
                minHeight: 380,
              }}
            >
              {/* Front face */}
              <div
                className="absolute inset-0 rounded-[32px] bg-surface-container-lowest ambient-shadow flex flex-col items-center justify-center p-8 gap-4"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <span className="text-[10px] uppercase tracking-widest font-headline font-black text-primary">
                  Question
                </span>

                {/* Visual anchor: image_url > emoji > nothing */}
                {card.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image_url}
                    alt=""
                    className="w-32 h-32 object-contain drop-shadow-xl"
                    aria-hidden="true"
                  />
                ) : card.emoji ? (
                  <motion.span
                    className="text-[6rem] md:text-[7rem] select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.22)]"
                    animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden="true"
                  >
                    {card.emoji}
                  </motion.span>
                ) : null}

                <p className="font-headline text-2xl md:text-3xl font-black text-on-surface text-center leading-tight">
                  {card.front}
                </p>
                <p className="text-xs font-body text-on-surface-variant mt-auto">
                  Tap to reveal answer
                </p>
              </div>

              {/* Back face (rotated 180°) */}
              <div
                className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-tertiary-container/40 to-tertiary-container/10 ring-2 ring-tertiary/30 flex flex-col items-center justify-center p-8 gap-4"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <span className="text-[10px] uppercase tracking-widest font-headline font-black text-tertiary">
                  Answer
                </span>
                <span className="material-symbols-outlined text-6xl text-tertiary">
                  check_circle
                </span>
                <p className="font-headline text-2xl md:text-3xl font-black text-on-surface text-center leading-tight">
                  {card.back}
                </p>
                <p className="text-xs font-body text-on-surface-variant mt-auto">
                  Tap to flip back
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!completed && (
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
            icon={isLast ? "celebration" : "arrow_forward"}
            onClick={handleNext}
            fullWidth
          >
            {isLast ? "Finish Deck" : "Next Card"}
          </Button>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {config.cards.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentIndex ? 1.3 : 1,
              backgroundColor:
                i === currentIndex
                  ? "var(--primary)"
                  : i < currentIndex
                    ? "var(--tertiary-container)"
                    : "var(--surface-container-highest)",
            }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="w-2.5 h-2.5 rounded-full"
          />
        ))}
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="text-center py-4"
          >
            <p className="font-headline text-4xl md:text-5xl font-black text-tertiary">
              🎉 Deck Complete! 🎉
            </p>
            <p className="font-body text-lg text-on-surface-variant mt-2">
              Great job going through every card.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
