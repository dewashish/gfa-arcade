"use client";

import { AVATARS } from "@/lib/game-engine/types";

interface AvatarProps {
  avatarId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-3xl",
  xl: "w-24 h-24 text-5xl",
};

export function Avatar({ avatarId, size = "md", className = "" }: AvatarProps) {
  const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

  return (
    <div
      className={`
        rounded-full flex items-center justify-center select-none
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ backgroundColor: avatar.color + "20" }}
    >
      <span>{avatar.emoji}</span>
    </div>
  );
}
