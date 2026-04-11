"use client";

import { motion } from "framer-motion";
import { ShapeFractionVisual } from "./ShapeFractionVisual";

/**
 * Renders a 2x2 grid of 4 shape variants labelled A, B, C, D —
 * for "visual options" questions where the student picks the letter
 * matching the shape. The quiz text options are A/B/C/D.
 */

type Shape = "circle" | "square" | "rectangle" | "pizza" | "chocolate";
type Pattern =
  | "whole"
  | "half-v"
  | "half-h"
  | "half-diag"
  | "quarter"
  | "uneven-2"
  | "thirds";

interface Props {
  shape: Shape;
  patterns: Pattern[]; // 4 entries
}

const LABELS = ["A", "B", "C", "D"];

export function ShapeOptionGridVisual({ shape, patterns }: Props) {
  const four = [...patterns, "whole", "whole", "whole", "whole"].slice(0, 4) as Pattern[];

  return (
    <div className="grid grid-cols-2 gap-3 max-w-[460px] mx-auto">
      {four.map((p, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
          className="relative bg-surface-container-lowest rounded-2xl p-3 ring-1 ring-outline-variant/40 flex items-center justify-center"
        >
          <span className="absolute top-2 left-3 font-headline font-black text-primary text-lg">
            {LABELS[i]}
          </span>
          <ShapeFractionVisual shape={shape} pattern={p} compact size={140} />
        </motion.div>
      ))}
    </div>
  );
}
