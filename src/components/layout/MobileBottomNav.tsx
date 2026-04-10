"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Mobile bottom navigation per ui-ux-pro-max `adaptive-navigation` rule.
 * Sidebar hides below 768px; this takes over so the teacher always
 * has primary nav reachable on tablet/phone.
 *
 * 5 items max per `bottom-nav-limit`. Uses both icon AND label per
 * `nav-label-icon`. Active state highlighted per `nav-state-active`.
 */
const navItems = [
  { icon: "home", label: "Home", href: "/dashboard" },
  { icon: "auto_stories", label: "Library", href: "/library" },
  { icon: "backpack", label: "Bank", href: "/bank" },
  { icon: "add_circle", label: "Create", href: "/create" },
  { icon: "leaderboard", label: "Reports", href: "/reports" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,98,158,0.08)] border-t border-outline-variant/20"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex justify-around items-stretch px-2 pt-2 pb-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={`
                  focus-ring flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl
                  min-h-[56px] transition-colors
                  ${active ? "text-primary" : "text-on-surface-variant hover:text-primary"}
                `}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{
                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] font-bold ${active ? "font-headline" : ""}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
