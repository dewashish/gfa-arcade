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
  onAddToTray?: (activity: BankActivity) => void;
  isInTray?: boolean;
}

/**
 * Activity Bank card — matches the Stitch "Activity Bank Catalog"
 * layout exactly:
 *
 *  ┌───────────────────────────────────┐  ← white card, p-6, shadow-xl
 *  │  ┌─────────────────────────────┐  │
 *  │  │   gradient hero box         │  │  ← h-48, rounded-lg
 *  │  │       (subject colour)      │  │
 *  │  │                             │  │
 *  │  │        🧙 mascot            │  │
 *  │  │                             │  │
 *  │  └──────────────┬──────────────┘  │
 *  │              (mascot peeks        │  ← absolute, -bottom-4
 *  │               below the box)     │
 *  │  MATHS · 10 items                 │  ← subject label in body
 *  │  Counting 1-10 Bonanza            │
 *  │  Practice finding pairs…          │
 *  │  [ Preview ]  [ ▶ Use in class ]  │
 *  └───────────────────────────────────┘
 *
 * On hover:
 *   - Card lifts and gets a `ring-4 ring-primary-container/30` glow
 *     (mirrors the Stitch "hovered state" card 1 in the mockup).
 *   - The mascot receives `hover={true}` which triggers its unique
 *     cinematic animation (cartwheeling 7, orbiting airplane, growing
 *     sprout, etc. — see SubjectMascot.tsx for per-subject choreography).
 *   - A soft scale-up on the hero gradient adds depth.
 */
export function BankCard({ activity, index, onPreview, onUse, isLaunching, onAddToTray, isInTray }: BankCardProps) {
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
      whileHover={{ y: -10 }}
      className={`group relative bg-surface-container-lowest rounded-[1.75rem] p-6 flex flex-col transition-[box-shadow,transform] duration-300 ${
        hover
          ? "shadow-[0_28px_60px_-16px_rgba(0,98,158,0.32)] ring-4 ring-primary-container/30"
          : "shadow-[0_20px_40px_-12px_rgba(0,98,158,0.14)]"
      }`}
      style={{ overflow: "visible" }}
    >
      {/* ============ HERO STAGE ============ */}
      {/* Inner rounded box holding the gradient + mascot. The box itself
          is clipped, but the mascot lives in an absolutely-positioned
          sibling layer that's overflow-visible so its head can peek below
          (and on hover, far above) the box. */}
      <div
        className="relative h-48 mb-6 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
        }}
      >
        {/* Decorative translucent shapes inside the gradient */}
        <motion.span
          aria-hidden="true"
          className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/15"
          animate={hover ? { scale: 1.2, rotate: 14 } : { scale: 1, rotate: 0 }}
          transition={SPRING.soft}
        />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-4 -right-6 w-20 h-20 rounded-full bg-white/10"
          animate={hover ? { scale: 1.12 } : { scale: 1 }}
          transition={SPRING.soft}
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-14 right-10 w-3 h-3 rounded-full bg-white/50"
          animate={hover ? { y: -6, opacity: 1 } : { y: 0, opacity: 0.5 }}
          transition={SPRING.soft}
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-6 left-20 w-2 h-2 rounded-full bg-white/60"
          animate={hover ? { y: -8, opacity: 1 } : { y: 0, opacity: 0.6 }}
          transition={{ ...SPRING.soft, delay: 0.04 }}
        />
      </div>

      {/* Mascot layer — positioned absolutely over the hero stage so it
          can overflow above/below. */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-6 h-48 flex items-end justify-center"
        style={{ overflow: "visible" }}
      >
        <motion.div
          animate={hover ? { y: -32, scale: 1.08 } : { y: -10, scale: 1 }}
          transition={SPRING.bouncy}
          className="w-44 h-44 drop-shadow-[0_16px_20px_rgba(0,0,0,0.24)]"
        >
          <SubjectMascot subject={subjectKey} hover={hover} className="w-full h-full" />
        </motion.div>
      </div>

      {/* ============ ADD TO TRAY BUTTON ============ */}
      {onAddToTray && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToTray(activity);
          }}
          disabled={isInTray}
          className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isInTray
              ? "bg-tertiary-container text-on-tertiary-container"
              : "bg-gradient-to-br from-primary to-primary-container text-white hover:shadow-xl"
          }`}
          aria-label={isInTray ? "Already in plan" : `Add ${activity.title} to class plan`}
        >
          <span className="material-symbols-outlined text-xl">
            {isInTray ? "check" : "add"}
          </span>
        </motion.button>
      )}

      {/* ============ CONTENT ============ */}
      <div className="relative flex flex-col gap-3 flex-1">
        {/* Subject label row */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-headline font-black uppercase tracking-widest"
            style={{ color: meta.gradient[1] }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-on-surface-variant font-body flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              format_list_numbered
            </span>
            {itemCount} item{itemCount === 1 ? "" : "s"}
            <span className="mx-1 text-outline-variant">·</span>
            <span aria-hidden="true">{gameInfo.emoji}</span>
            <span className="sr-only">{gameInfo.label}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-headline font-black text-xl md:text-2xl text-on-surface leading-tight">
          {activity.title}
        </h3>

        {/* Description */}
        {activity.description && (
          <p className="font-body text-sm text-on-surface-variant line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-auto pt-4">
          <button
            onClick={() => onPreview(activity)}
            disabled={isLaunching}
            aria-label={`Preview ${activity.title}`}
            className="focus-ring flex-1 h-12 rounded-full border-2 border-outline-variant text-on-surface font-headline font-bold text-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Preview
          </button>
          <button
            onClick={() => onUse(activity)}
            disabled={isLaunching}
            aria-label={`Use ${activity.title} in class`}
            className="focus-ring flex-[1.5] h-12 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isLaunching ? (
              <>
                <span
                  className="material-symbols-outlined text-base animate-spin"
                  aria-hidden="true"
                >
                  progress_activity
                </span>
                Starting...
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
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
