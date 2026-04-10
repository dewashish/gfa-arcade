"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useConfetti } from "@/hooks/useConfetti";
import { useSound } from "@/hooks/useSound";

interface CelebrationOverlayProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  onDismiss?: () => void;
}

/**
 * Full-screen celebration overlay for end-of-game / level-up moments.
 * Fires fireworks confetti and plays applause + tada sounds on open.
 */
export function CelebrationOverlay({
  open,
  title = "Great Job!",
  subtitle,
  onDismiss,
}: CelebrationOverlayProps) {
  const { fireworks } = useConfetti();
  const { play } = useSound();

  useEffect(() => {
    if (!open) return;
    fireworks();
    play("tada");
    play("applause");
  }, [open, fireworks, play]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center glass-panel"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.6, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="bg-surface-container-lowest rounded-xl px-12 py-16 text-center ambient-shadow-lg max-w-md mx-4"
          >
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="font-headline font-black text-5xl text-primary -rotate-1 mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg font-body text-on-surface-variant">{subtitle}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
