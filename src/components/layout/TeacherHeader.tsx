"use client";

import { motion } from "framer-motion";
import { ProfileMenu } from "./ProfileMenu";
import { Breadcrumb } from "./Breadcrumb";
import { SPRING } from "@/lib/design/motion";

interface TeacherHeaderProps {
  teacherName: string;
  teacherEmail?: string;
  teacherRole?: string;
}

/**
 * Sticky top app bar.
 *
 * Layout (left → right):
 *   • App wordmark — "Founders Arcade" with a "Teacher's Portal"
 *     subtitle. The school branding (GEMS Founders School Masdar
 *     City logo) lives in the TeacherSidebar so there's no
 *     duplication between the two surfaces.
 *   • Breadcrumb — current route trail.
 *   • ProfileMenu — avatar + dropdown with settings / sign out.
 */
export function TeacherHeader({
  teacherName,
  teacherEmail,
  teacherRole = "Year 1 Teacher",
}: TeacherHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING.snappy}
      className="bg-white/80 backdrop-blur-xl w-full sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,98,158,0.08)] flex justify-between items-center px-4 md:px-6 py-3 md:py-4 gap-4"
    >
      {/* Left: app wordmark */}
      <div className="flex flex-col shrink-0">
        <p
          className="font-headline font-black italic text-lg md:text-xl text-primary leading-tight"
          style={{ letterSpacing: "-0.01em" }}
        >
          Founders Arcade
        </p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
          Teacher&rsquo;s Portal
        </p>
      </div>

      {/* Middle: breadcrumb */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <Breadcrumb />
      </div>

      {/* Right: profile menu */}
      <ProfileMenu
        teacherName={teacherName}
        teacherEmail={teacherEmail}
        teacherRole={teacherRole}
      />
    </motion.header>
  );
}
