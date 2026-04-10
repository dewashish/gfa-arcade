"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SUBJECT_META, getActivityImage, type SubjectKey } from "@/lib/bank/imagery";
import { GAME_TYPE_LABELS, countActivityItems, type BankActivity } from "@/lib/bank/types";
import { SPRING } from "@/lib/design/motion";

interface BankCardProps {
  activity: BankActivity;
  index: number;
  onPreview: (activity: BankActivity) => void;
  onUse: (activity: BankActivity) => void;
  isLaunching: boolean;
}

export function BankCard({ activity, index, onPreview, onUse, isLaunching }: BankCardProps) {
  const [hover, setHover] = useState(false);

  const subjectKey = (activity.subject ?? "maths") as SubjectKey;
  const meta = SUBJECT_META[subjectKey] ?? SUBJECT_META.maths;
  const image = getActivityImage(activity);
  const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? { label: activity.game_type, emoji: "🎮" };
  const itemCount = countActivityItems(activity.config_json);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...SPRING.bouncy,
        delay: Math.min(index * 0.04, 0.4),
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ y: -6 }}
      className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden flex flex-col group"
    >
      {/* Hero image */}
      <div
        className="relative h-44 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
        }}
      >
        <motion.div
          animate={hover ? { scale: 1.08 } : { scale: 1 }}
          transition={SPRING.bouncy}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="w-32 h-32 object-contain drop-shadow-xl"
            loading={index < 6 ? "eager" : "lazy"}
            priority={index < 3}
          />
        </motion.div>

        {/* Top-left: subject pill */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-on-surface">
          {meta.label}
        </div>

        {/* Top-right: game type pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 text-on-surface">
          <span aria-hidden="true">{gameInfo.emoji}</span>
          {gameInfo.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
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
