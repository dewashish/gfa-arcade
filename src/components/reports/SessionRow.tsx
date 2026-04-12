"use client";

import { motion } from "framer-motion";
import { SPRING } from "@/lib/design/motion";

interface SessionRowProps {
  index: number;
  title: string;
  date: string;
  participants: number;
  topScorer?: { name: string; avatarId: string; score: number } | null;
}

const AVATAR_EMOJI: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  penguin: "🐧",
  bunny: "🐰",
  bear: "🐻",
  owl: "🦉",
  fox: "🦊",
  panda: "🐼",
  lion: "🦁",
  falcon: "🦅",
  dragon: "🐉",
  robot: "🤖",
  astronaut: "🧑‍🚀",
  superhero: "🦸",
  star: "⭐",
  rocket: "🚀",
};

export function SessionRow({ index, title, date, participants, topScorer }: SessionRowProps) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING.snappy, delay: Math.min(index * 0.04, 0.3) }}
      className="bg-surface-container-lowest rounded-2xl p-4 ambient-shadow flex items-center gap-4 hover:translate-x-1 transition-transform"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-container/20 to-tertiary-container/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary" aria-hidden="true">
          history
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-headline font-bold text-on-surface truncate">{title}</p>
        <p className="text-xs text-on-surface-variant font-body">
          {date} · {participants} student{participants === 1 ? "" : "s"}
        </p>
      </div>
      {topScorer && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-2xl" aria-hidden="true">
            {AVATAR_EMOJI[topScorer.avatarId] ?? "⭐"}
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant font-body uppercase tracking-wider">
              Top
            </p>
            <p className="font-headline font-black text-sm text-primary">
              {topScorer.score.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </motion.li>
  );
}
