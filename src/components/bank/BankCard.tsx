"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SUBJECT_META, type SubjectKey } from "@/lib/bank/imagery";
import { GAME_TYPE_LABELS, countActivityItems, type BankActivity } from "@/lib/bank/types";
import { SPRING } from "@/lib/design/motion";
import { SubjectMascot } from "./SubjectMascot";

interface BankCardProps {
  activity: BankActivity;
  index: number;
  onPreview: (activity: BankActivity) => void;
  onUse: (activity: BankActivity) => void;
  isLaunching: boolean;
}

/**
 * The Activity Bank card — character-led, kid-friendly, and interactive.
 *
 * Layout notes (the "pop out from the top" effect):
 *  - The article itself has `overflow-visible` so the mascot can
 *    translate above the card bounds on hover.
 *  - The hero stage holds the gradient + decorative shapes and is its
 *    OWN clipped layer (`overflow-hidden`) so those background bits
 *    don't leak above the card.
 *  - The mascot lives in an absolute sibling layer on top of the hero
 *    stage with `overflow-visible`, so on hover Framer Motion
 *    translates it up (y: -24) and its head pokes above the card's
 *    top edge. At rest it sits flush inside the hero.
 *  - A subtle idle bob loop gives the mascot life even without hover.
 */
export function BankCard({ activity, index, onPreview, onUse, isLaunching }: BankCardProps) {
  const [hover, setHover] = useState(false);

  const subjectKey = (activity.subject ?? "maths") as SubjectKey;
  const meta = SUBJECT_META[subjectKey] ?? SUBJECT_META.maths;
  const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? { label: activity.game_type, emoji: "🎮" };
  const itemCount = countActivityItems(activity.config_json);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...SPRING.bouncy,
        delay: Math.min(index * 0.02, 0.2),
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ y: -6 }}
      className="relative bg-surface-container-lowest rounded-[28px] ambient-shadow flex flex-col group"
      style={{ overflow: "visible" }}
    >
      {/* Hero stage — clipped layer for gradient + decorations */}
      <div
        className="relative h-48 rounded-t-[28px] overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
        }}
      >
        {/* Decorative floating shapes inside the gradient */}
        <motion.span
          aria-hidden="true"
          className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/15"
          animate={hover ? { scale: 1.15, rotate: 12 } : { scale: 1, rotate: 0 }}
          transition={SPRING.soft}
        />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10"
          animate={hover ? { scale: 1.1 } : { scale: 1 }}
          transition={SPRING.soft}
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-16 right-10 w-3 h-3 rounded-full bg-white/50"
          animate={hover ? { y: -4, opacity: 1 } : { y: 0, opacity: 0.5 }}
          transition={SPRING.soft}
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-6 left-16 w-2 h-2 rounded-full bg-white/60"
          animate={hover ? { y: -6, opacity: 1 } : { y: 0, opacity: 0.6 }}
          transition={{ ...SPRING.soft, delay: 0.04 }}
        />

        {/* Subject pill (top-left) */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-on-surface z-20">
          {meta.label}
        </div>
        {/* Game-type pill (top-right) */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 text-on-surface z-20">
          <span aria-hidden="true">{gameInfo.emoji}</span>
          {gameInfo.label}
        </div>
      </div>

      {/* Mascot layer — sits on top of the hero stage and is allowed to
          overflow above the card for the pop-out effect. */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-48 flex items-end justify-center z-10"
        style={{ overflow: "visible" }}
      >
        <motion.div
          animate={
            hover
              ? { y: -28, scale: 1.06, rotate: -2 }
              : { y: [0, -3, 0], scale: 1, rotate: 0 }
          }
          transition={
            hover
              ? SPRING.bouncy
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="w-40 h-40 drop-shadow-[0_14px_18px_rgba(0,0,0,0.22)]"
        >
          <SubjectMascot subject={subjectKey} className="w-full h-full" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative p-5 flex flex-col gap-3 flex-1 z-0">
        <h3 className="font-headline font-black text-lg text-on-surface leading-tight">
          {activity.title}
        </h3>
        {activity.description && (
          <p className="text-sm text-on-surface-variant font-body line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-on-surface-variant pt-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              format_list_numbered
            </span>
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          {activity.year_level && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                school
              </span>
              {activity.year_level}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3">
          <button
            onClick={() => onPreview(activity)}
            disabled={isLaunching}
            aria-label={`Preview ${activity.title}`}
            className="focus-ring flex-1 h-11 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold text-sm transition-colors disabled:opacity-50"
          >
            Preview
          </button>
          <button
            onClick={() => onUse(activity)}
            disabled={isLaunching}
            aria-label={`Use ${activity.title} in class`}
            className="focus-ring flex-[2] h-11 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isLaunching ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin" aria-hidden="true">
                  progress_activity
                </span>
                Starting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  play_arrow
                </span>
                Use in class
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
