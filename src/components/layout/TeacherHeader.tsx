"use client";

import Image from "next/image";
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
 * Branding block (left): the official GEMS Founders School — Masdar
 * City logo sits next to the "Founders Arcade" app name and a small
 * "Teacher's Portal" subtitle. The logo image already conveys
 * "GEMS Founders School · Masdar City Campus" so we don't repeat
 * that text here; the app name + role is the thing that's specific
 * to this product.
 *
 * Desktop shows logo + text. Mobile shows logo only (the logo is
 * self-describing at 40px tall thanks to the "GEMS · Founders School
 * · MASDAR CITY" layout being baked into the asset).
 *
 * The breadcrumb sits in the middle and the profile menu on the
 * right — matches the Stitch Teacher Dashboard mockup's top bar.
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
      {/* Left: GEMS logo + app name */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <Image
          src="/gems-logo.png"
          alt="GEMS Founders School Masdar City"
          width={531}
          height={131}
          priority
          className="h-10 md:h-12 w-auto select-none"
        />
        <div className="hidden md:flex flex-col border-l border-outline-variant/30 pl-4">
          <p
            className="font-headline font-black italic text-lg text-primary leading-tight"
            style={{ letterSpacing: "-0.01em" }}
          >
            Founders Arcade
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Teacher&rsquo;s Portal
          </p>
        </div>
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
