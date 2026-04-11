"use client";

import { motion } from "framer-motion";

/**
 * Renders N identical countable objects in a grid row.
 * Used for counting questions AND "half/quarter of a quantity" questions
 * where the student needs to count visible items.
 *
 * If `divider` is set, a dashed line is drawn after that many items to
 * visually suggest a split — but the divider is ALWAYS at the middle
 * (for half questions) or at N/4 (for quarter questions), so it
 * represents the geometric split, not the correct numeric answer.
 */

type ObjectKind = "apple" | "smile" | "star" | "dot" | "heart" | "cookie" | "balloon";

interface Props {
  object: ObjectKind;
  count: number;
  divider?: number;
}

const EMOJI: Record<ObjectKind, string> = {
  apple: "🍎",
  smile: "😊",
  star: "⭐",
  dot: "●",
  heart: "❤️",
  cookie: "🍪",
  balloon: "🎈",
};

export function CountedObjectsVisual({ object, count, divider }: Props) {
  const items = Array.from({ length: Math.min(count, 20) });

  return (
    <div className="relative flex flex-col items-center gap-3 py-4">
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-[520px] relative">
        {items.map((_, i) => (
          <motion.span
            key={i}
            className="text-4xl md:text-5xl select-none"
            animate={{
              y: [0, -6, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          >
            {EMOJI[object]}
            {divider !== undefined && i === divider - 1 && (
              <span className="inline-block w-0 h-10 border-l-4 border-dashed border-primary/60 mx-3 align-middle" />
            )}
          </motion.span>
        ))}
      </div>
      <span className="font-headline font-black text-2xl text-on-surface-variant">
        = {count}
      </span>
    </div>
  );
}
