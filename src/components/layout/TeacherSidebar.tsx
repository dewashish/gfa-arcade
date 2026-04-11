"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { TRANSITION } from "@/lib/design/motion";

const navItems = [
  { icon: "home", label: "Home", href: "/dashboard" },
  { icon: "auto_stories", label: "My Library", href: "/library" },
  { icon: "backpack", label: "Activity Bank", href: "/bank" },
  { icon: "add_circle", label: "Create", href: "/create" },
  { icon: "leaderboard", label: "Reports", href: "/reports" },
];

interface TeacherSidebarProps {
  teacherName?: string;
  teacherEmail?: string;
  teacherRole?: string;
}

export function TeacherSidebar({
  teacherName = "Teacher",
  teacherRole = "Year 1 Teacher",
}: TeacherSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex flex-col h-screen p-6 w-72 bg-surface-container-lowest shrink-0 sticky top-0 rounded-r-[3rem] shadow-[20px_0_60px_rgba(0,98,158,0.04)]"
    >
      <div className="mb-10 px-4">
        <h1 className="text-xl font-black text-primary font-headline">Adventure Hub</h1>
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mt-1">
          Year 1 · Masdar City
        </p>
      </div>

      <nav className="flex-1 space-y-2" aria-label="Sections">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`
                focus-ring flex items-center gap-4 px-6 py-4 rounded-full font-body transition-colors
                ${
                  active
                    ? "text-primary font-bold bg-white shadow-sm"
                    : "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary font-medium"
                }
              `}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <Link href="/bank" className="focus-ring block">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={TRANSITION.fast}
            className="w-full py-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary-container rounded-full font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              backpack
            </span>
            <span>Browse Bank</span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-3 px-4">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-xl shadow-md"
            aria-hidden="true"
          >
            🧑‍🏫
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{teacherName}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider truncate">
              {teacherRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
