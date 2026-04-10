"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Tone = "primary" | "primary-container" | "secondary" | "tertiary" | "on-surface";
type Size = "sm" | "md" | "lg" | "xl" | "display";

interface KineticHeadlineProps extends Omit<HTMLMotionProps<"h1">, "ref"> {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  rotate?: number;
  as?: "h1" | "h2" | "h3";
}

const toneClass: Record<Tone, string> = {
  primary: "text-primary",
  "primary-container": "text-primary-container",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  "on-surface": "text-on-surface",
};

const sizeClass: Record<Size, string> = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl",
  xl: "text-5xl md:text-6xl",
  display: "text-6xl md:text-7xl",
};

/**
 * Kinetic Playground display headline.
 * Default rotation: -1deg for an editorial-playful feel.
 */
export function KineticHeadline({
  children,
  tone = "on-surface",
  size = "lg",
  rotate = -1,
  as = "h1",
  className = "",
  ...rest
}: KineticHeadlineProps) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y: 24, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`font-headline font-black leading-tight ${toneClass[tone]} ${sizeClass[size]} origin-left ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
