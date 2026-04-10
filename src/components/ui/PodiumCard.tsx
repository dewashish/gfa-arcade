"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/game-engine/types";
import { Avatar } from "./Avatar";

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  highlight?: boolean;
}

const PODIUM_STYLES = {
  1: {
    ringClass: "border-secondary-container",
    badgeClass: "bg-secondary-container text-on-secondary-container",
    columnClass: "h-36 md:h-48 bg-white shadow-2xl scale-110",
    icon: "emoji_events",
    badgeIcon: "workspace_premium",
    avatarSize: "xl" as const,
  },
  2: {
    ringClass: "border-slate-300",
    badgeClass: "bg-slate-300 text-white",
    columnClass: "h-24 md:h-32 bg-surface-container-low",
    icon: "military_tech",
    badgeIcon: "military_tech",
    avatarSize: "lg" as const,
  },
  3: {
    ringClass: "border-amber-700/60",
    badgeClass: "bg-amber-700/70 text-white",
    columnClass: "h-20 md:h-28 bg-surface-container-low",
    icon: "military_tech",
    badgeIcon: "military_tech",
    avatarSize: "lg" as const,
  },
};

export function PodiumCard({ entry, rank, highlight = false }: PodiumCardProps) {
  const style = PODIUM_STYLES[rank];

  return (
    <motion.div
      layout
      layoutId={`podium-${entry.student_id}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex flex-col items-center"
    >
      <div className={`relative mb-4 ${rank === 1 ? "scale-110 mb-6" : ""}`}>
        <div className={`rounded-full border-4 ${style.ringClass} overflow-hidden shadow-xl`}>
          <Avatar avatarId={entry.avatar_id} size={style.avatarSize} />
        </div>
        {rank === 1 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <span
              className="material-symbols-outlined text-secondary-container text-5xl drop-shadow"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
          </div>
        )}
        <div className={`absolute -bottom-2 -right-2 h-10 w-10 rounded-full flex items-center justify-center shadow-md ${style.badgeClass}`}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {style.badgeIcon}
          </span>
        </div>
      </div>
      <div
        className={`w-full rounded-t-xl flex flex-col items-center justify-center px-4 ${style.columnClass} ${highlight ? "ring-2 ring-primary/30" : ""}`}
      >
        <span className={`font-headline font-bold ${rank === 1 ? "text-2xl" : "text-lg"} truncate max-w-full`}>
          {entry.student_name}
        </span>
        {rank === 1 && (
          <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-xs font-black mb-2 italic mt-1">
            WINNING STREAK!
          </span>
        )}
        <span className={`text-primary font-black ${rank === 1 ? "text-4xl" : "text-2xl"}`}>
          {entry.total_score.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
