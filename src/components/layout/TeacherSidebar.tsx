"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "add_circle", label: "Create", href: "/create" },
  { icon: "school", label: "Classrooms", href: "/dashboard" },
  { icon: "quiz", label: "Question Bank", href: "/create" },
  { icon: "leaderboard", label: "Analytics", href: "/dashboard" },
];

interface TeacherSidebarProps {
  teacherName?: string;
  teacherEmail?: string;
}

export function TeacherSidebar({ teacherName = "Teacher" }: TeacherSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen p-6 w-72 bg-surface-container-lowest shrink-0 sticky top-0 rounded-r-[3rem] shadow-[20px_0_60px_rgba(0,98,158,0.04)]">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-black text-primary font-headline">Teacher Portal</h1>
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mt-1">
          Masdar City Campus
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                flex items-center gap-4 px-6 py-4 rounded-full transition-all font-body
                ${
                  isActive
                    ? "text-primary font-bold bg-white shadow-sm scale-[0.98]"
                    : "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary font-medium"
                }
              `}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <Link href="/create">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create New Quiz</span>
          </motion.button>
        </Link>

        <div className="flex items-center gap-3 px-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-container to-tertiary-container flex items-center justify-center text-xl shadow-md">
            🧑‍🏫
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{teacherName}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Year 1 Lead
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
