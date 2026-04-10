"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KineticHeadline } from "@/components/ui/KineticHeadline";

const GAME_TYPES = [
  {
    slug: "spin-wheel",
    title: "Spin the Wheel",
    description: "A random wheel that picks questions, rewards, or challenges!",
    icon: "casino",
    emoji: "🎡",
    color: "#2E97E6",
    tag: "Numeracy",
  },
  {
    slug: "match-up",
    title: "Match Up",
    description: "Drag and drop to match terms with their correct definitions.",
    icon: "compare_arrows",
    emoji: "🔤",
    color: "#00A396",
    tag: "Literacy",
  },
  {
    slug: "quiz",
    title: "Quiz",
    description: "Multiple choice questions with timed rounds and competitive scoring.",
    icon: "quiz",
    emoji: "❓",
    color: "#FFB800",
    tag: "Most Popular",
    badge: true,
  },
  {
    slug: "flashcards",
    title: "Flash Cards",
    description: "Flip cards to reveal answers. Great for memorization!",
    icon: "style",
    emoji: "🃏",
    color: "#FF8A80",
    tag: "Memory",
  },
  {
    slug: "speaking-cards",
    title: "Speaking Cards",
    description: "Random cards dealt from a shuffled deck for speaking practice.",
    icon: "record_voice_over",
    emoji: "🎤",
    color: "#E040FB",
    tag: "Speaking",
  },
  {
    slug: "group-sort",
    title: "Group Sort",
    description: "Drag items into their correct category groups.",
    icon: "category",
    emoji: "🗂️",
    color: "#7C5800",
    tag: "Sorting",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

export default function CreatePage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <motion.div variants={item}>
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Create a New <span className="text-primary-container">Adventure</span>
        </KineticHeadline>
        <p className="text-on-surface-variant font-body mt-2 text-lg">
          Pick a game type to start building an activity for your class
        </p>
      </motion.div>

      {/* Teacher Tip */}
      <motion.div
        variants={item}
        className="flex items-start gap-4 p-5 rounded-xl bg-secondary-container/15 ambient-shadow"
      >
        <span
          className="material-symbols-outlined text-secondary text-3xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          lightbulb
        </span>
        <div>
          <p className="text-sm font-headline font-bold text-on-surface mb-1 uppercase tracking-wider">
            Teacher Tip
          </p>
          <p className="text-base text-on-surface font-body">
            Year 1 adventurers love quick wins. Aim for 5–8 items per activity for the best engagement!
          </p>
        </div>
      </motion.div>

      {/* Game Type Grid */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {GAME_TYPES.map((game) => (
          <motion.div key={game.slug} variants={item}>
            <Link href={`/create/${game.slug}`}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden h-full cursor-pointer"
              >
                {/* Hero with emoji */}
                <div
                  className="h-40 relative flex items-center justify-center text-7xl"
                  style={{
                    background: `linear-gradient(135deg, ${game.color}33, ${game.color}11)`,
                  }}
                >
                  {game.emoji}
                  <div
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase"
                    style={{ color: game.color }}
                  >
                    {game.tag}
                  </div>
                  {game.badge && (
                    <div className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md">
                      ⭐ POPULAR
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="font-headline text-xl font-black text-on-surface">
                    {game.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                    {game.description}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-primary font-bold text-sm">
                    Build it
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
