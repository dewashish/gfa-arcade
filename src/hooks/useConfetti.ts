"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

export function useConfetti() {
  const burst = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2E97E6", "#FFB800", "#00A396", "#FF8A80", "#E040FB"],
    });
  }, []);

  const rain = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#2E97E6", "#FFB800", "#00A396"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#2E97E6", "#FFB800", "#00A396"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const fireworks = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ["#2E97E6", "#FFB800", "#00A396", "#FF8A80", "#6200EA"],
    };

    confetti({ ...defaults, particleCount: count * 0.25, spread: 26, startVelocity: 55 });
    confetti({ ...defaults, particleCount: count * 0.2, spread: 60 });
    confetti({ ...defaults, particleCount: count * 0.35, spread: 100, decay: 0.91, scalar: 0.8 });
    confetti({ ...defaults, particleCount: count * 0.1, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    confetti({ ...defaults, particleCount: count * 0.1, spread: 120, startVelocity: 45 });
  }, []);

  return { burst, rain, fireworks };
}
