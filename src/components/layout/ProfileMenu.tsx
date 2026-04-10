"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { TRANSITION, SPRING } from "@/lib/design/motion";

interface ProfileMenuProps {
  teacherName: string;
  teacherEmail?: string;
}

export function ProfileMenu({ teacherName, teacherEmail }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile menu"
        className="focus-ring flex items-center gap-3 pl-3 pr-2 py-1 rounded-full hover:bg-surface-container-low transition-colors"
      >
        <div className="hidden md:block text-right">
          <p className="font-headline font-bold text-sm leading-tight">{teacherName}</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            Year 1 Lead
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-container to-tertiary-container flex items-center justify-center text-xl shadow-md"
          aria-hidden="true"
        >
          🧑‍🏫
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={SPRING.snappy}
            role="menu"
            aria-label="Profile options"
            className="absolute right-0 mt-3 w-64 bg-white rounded-xl ambient-shadow-lg py-2 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-outline-variant/15">
              <p className="font-headline font-bold text-on-surface">{teacherName}</p>
              {teacherEmail && (
                <p className="text-xs text-on-surface-variant truncate">{teacherEmail}</p>
              )}
            </div>

            {/* Items */}
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="focus-ring flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">
                settings
              </span>
              <span className="font-body font-medium">Settings</span>
            </Link>

            <Link
              href="/library"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="focus-ring flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">
                auto_stories
              </span>
              <span className="font-body font-medium">My Library</span>
            </Link>

            {/* Danger zone */}
            <div className="border-t border-outline-variant/15 mt-1 pt-1">
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="focus-ring w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/30 transition-colors text-left"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
                <span className="font-body font-bold">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
