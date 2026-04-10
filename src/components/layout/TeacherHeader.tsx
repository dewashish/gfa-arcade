"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface TeacherHeaderProps {
  teacherName: string;
  schoolName?: string;
}

/**
 * Sticky top app bar for the teacher area.
 * Tinted shadow, glassmorphism, brand + nav + quick action.
 */
export function TeacherHeader({ teacherName, schoolName = "GEMS Founders School" }: TeacherHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="bg-white/80 backdrop-blur-xl w-full sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,98,158,0.08)] flex justify-between items-center px-6 py-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-white text-2xl">school</span>
        </div>
        <div>
          <p className="font-headline font-black text-lg text-primary leading-tight">Adventure Hub</p>
          <p className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant">
            {schoolName}
          </p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/dashboard"
          className="text-primary font-bold border-b-4 border-primary-container py-2 hover:scale-105 transition-transform"
        >
          Library
        </Link>
        <Link
          href="/create"
          className="text-on-surface-variant font-medium py-2 hover:scale-105 hover:text-primary transition-all"
        >
          Create
        </Link>
        <Link
          href="/dashboard"
          className="text-on-surface-variant font-medium py-2 hover:scale-105 hover:text-primary transition-all"
        >
          Reports
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <button className="p-2 text-secondary hover:bg-secondary-container/30 rounded-full transition-colors">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        </button>
        <button className="p-2 text-secondary hover:bg-secondary-container/30 rounded-full transition-colors">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            emoji_events
          </span>
        </button>
        <div className="hidden md:flex items-center gap-3 pl-3 ml-1 border-l border-outline-variant/20">
          <div className="text-right">
            <p className="font-headline font-bold text-sm leading-tight">{teacherName}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Year 1 Lead
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-container to-tertiary-container flex items-center justify-center text-xl shadow-md">
            🧑‍🏫
          </div>
        </div>
      </div>
    </motion.header>
  );
}
