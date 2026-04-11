"use client";

import { motion } from "framer-motion";

/**
 * A U-shaped magnet next to a household item, with an idle wobble and
 * a subtle "attraction" pulse between them. The animation is neutral
 * — it never reveals whether the object is magnetic or not. The
 * wobble is always the same regardless of the item.
 */

type ObjectKind =
  | "nail"
  | "spoon"
  | "fork"
  | "paper"
  | "plastic-toy"
  | "wood-block"
  | "rubber-band"
  | "key"
  | "coin"
  | "scissors"
  | "sponge"
  | "glass"
  | "fridge"
  | "paperclip"
  | "eraser";

const OBJECT_EMOJI: Record<ObjectKind, string> = {
  nail: "🔩",
  spoon: "🥄",
  fork: "🍴",
  paper: "📄",
  "plastic-toy": "🧸",
  "wood-block": "🪵",
  "rubber-band": "➰",
  key: "🔑",
  coin: "🪙",
  scissors: "✂️",
  sponge: "🧽",
  glass: "🥛",
  fridge: "🧊",
  paperclip: "📎",
  eraser: "🧴",
};

const OBJECT_LABEL: Record<ObjectKind, string> = {
  nail: "Iron Nail",
  spoon: "Metal Spoon",
  fork: "Metal Fork",
  paper: "Paper",
  "plastic-toy": "Plastic Toy",
  "wood-block": "Wooden Block",
  "rubber-band": "Rubber Band",
  key: "Key",
  coin: "Coin",
  scissors: "Scissors",
  sponge: "Sponge",
  glass: "Glass Cup",
  fridge: "Ice Cube",
  paperclip: "Paperclip",
  eraser: "Eraser",
};

interface Props {
  object: ObjectKind;
}

export function MagnetObjectVisual({ object }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-12 py-6">
      {/* U-shaped magnet */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="relative"
          animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 120 120"
            aria-hidden="true"
            style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.18))" }}
          >
            {/* Red body */}
            <path
              d="M 20 20 L 50 20 L 50 70 Q 50 90 60 90 Q 70 90 70 70 L 70 20 L 100 20 L 100 70 Q 100 110 60 110 Q 20 110 20 70 Z"
              fill="#E53935"
              stroke="#8B0000"
              strokeWidth="3"
            />
            {/* Silver tips */}
            <rect x="20" y="14" width="30" height="12" fill="#BDBDBD" stroke="#616161" strokeWidth="2" rx="2" />
            <rect x="70" y="14" width="30" height="12" fill="#BDBDBD" stroke="#616161" strokeWidth="2" rx="2" />
            {/* N / S labels */}
            <text
              x="35"
              y="23"
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="900"
              fontSize="10"
              fill="#212121"
            >
              N
            </text>
            <text
              x="85"
              y="23"
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="900"
              fontSize="10"
              fill="#212121"
            >
              S
            </text>
          </svg>
          {/* Magnetic field lines — always drawn, decorative, neutral */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-full top-1/2 w-8 h-8 rounded-full border-2 border-secondary-container"
              style={{ transform: "translate(-50%, -50%)" }}
              animate={{
                scale: [0.6, 1.4, 0.6],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
        <span className="text-xs font-headline font-black text-on-surface-variant uppercase tracking-widest">
          Magnet
        </span>
      </div>

      {/* Object */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="text-7xl md:text-8xl select-none"
          animate={{ y: [0, -6, 0], rotate: [3, -3, 3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {OBJECT_EMOJI[object]}
        </motion.div>
        <span className="text-xs font-headline font-black text-on-surface-variant uppercase tracking-widest text-center">
          {OBJECT_LABEL[object]}
        </span>
      </div>
    </div>
  );
}
