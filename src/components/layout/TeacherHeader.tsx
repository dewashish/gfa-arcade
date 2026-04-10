"use client";

import { motion } from "framer-motion";
import { ProfileMenu } from "./ProfileMenu";
import { Breadcrumb } from "./Breadcrumb";
import { SPRING } from "@/lib/design/motion";

interface TeacherHeaderProps {
  teacherName: string;
  teacherEmail?: string;
}

/**
 * Sticky top app bar.
 *
 * Per ui-ux-pro-max audit: header no longer duplicates sidebar nav.
 * Brand on the left, breadcrumb in the middle, profile menu on the right.
 * Sidebar is the single source of nav truth.
 */
export function TeacherHeader({ teacherName, teacherEmail }: TeacherHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING.snappy}
      className="bg-white/80 backdrop-blur-xl w-full sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,98,158,0.08)] flex justify-between items-center px-4 md:px-6 py-3 md:py-4 gap-4"
    >
      {/* Left: brand (mobile shows logo only) */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-white text-xl md:text-2xl">
            school
          </span>
        </div>
        <div className="hidden md:block">
          <p className="font-headline font-black text-base text-primary leading-tight">
            Adventure Hub
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            GEMS Founders School
          </p>
        </div>
      </div>

      {/* Middle: breadcrumb */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <Breadcrumb />
      </div>

      {/* Right: profile menu */}
      <ProfileMenu teacherName={teacherName} teacherEmail={teacherEmail} />
    </motion.header>
  );
}
