"use client";

import { motion } from "framer-motion";

/**
 * Shows a single word with its illustrated emoji / cartoon. Used for
 * phonics sound-recognition questions — the student hears/sees the
 * word with its picture and answers which sound it contains.
 *
 * The word itself is shown (Year 1 readers can map letters to sounds),
 * and the illustration is a playful emoji that matches the word. The
 * visual never highlights the answer-carrying grapheme — the student
 * has to find it themselves.
 */

const ILLUSTRATIONS: Record<string, string> = {
  // oy / ir / ue / aw (Phase 3 digraphs — single-topic quiz)
  boy: "👦",
  toy: "🧸",
  coin: "🪙",
  oil: "🛢️",
  bird: "🐦",
  girl: "👧",
  shirt: "👕",
  skirt: "👗",
  blue: "🔵",
  glue: "🩹",
  rescue: "🚑",
  statue: "🗽",
  saw: "🪚",
  straw: "🥤",
  paw: "🐾",
  yawn: "😮",
  // sh / ch / th (for mixed phonics review quiz)
  fish: "🐟",
  ship: "🚢",
  chip: "🍟",
  chair: "🪑",
  cherry: "🍒",
  thumb: "👍",
  moth: "🦋",
  bath: "🛁",
};

interface Props {
  word: string;
  illustration: keyof typeof ILLUSTRATIONS;
}

export function PhonicsWordVisual({ word, illustration }: Props) {
  const emoji = ILLUSTRATIONS[illustration] ?? "✨";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      {/* Emoji illustration — bobs gently */}
      <motion.div
        className="text-[7rem] md:text-[8rem] select-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
        animate={{
          y: [0, -8, 0],
          rotate: [-3, 3, -3],
          scale: [1, 1.04, 1],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        {emoji}
      </motion.div>
      {/* Word, in a pill */}
      <motion.div
        className="px-8 py-3 rounded-full bg-primary-container text-on-primary-container font-headline font-black text-3xl md:text-4xl shadow-lg shadow-primary/20"
        initial={{ scale: 0.9 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {word}
      </motion.div>
    </div>
  );
}
