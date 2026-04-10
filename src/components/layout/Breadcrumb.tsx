"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Lightweight breadcrumb for deep teacher routes.
 * Per ui-ux-pro-max `breadcrumb-web` rule for 3+ level deep hierarchies.
 *
 * Auto-generates crumbs from the URL path; consumers can pass an
 * override label for the leaf segment (e.g. activity title).
 */
interface BreadcrumbProps {
  leafLabel?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Home",
  library: "My Library",
  bank: "Activity Bank",
  create: "Create",
  reports: "Reports",
  settings: "Settings",
  session: "Live Session",
  play: "Game",
  leaderboard: "Leaderboard",
};

export function Breadcrumb({ leafLabel }: BreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1 && segments[0] === "dashboard") return null;

  // Build crumb chain
  const crumbs: Array<{ label: string; href: string | null }> = [
    { label: "Home", href: "/dashboard" },
  ];

  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    // Don't add the dashboard crumb twice
    if (seg === "dashboard") return;
    // Skip dynamic-route brackets
    const cleaned = seg.replace(/^\[|\]$/g, "");
    const label = isLast && leafLabel ? leafLabel : SEGMENT_LABELS[cleaned] ?? cleaned;
    crumbs.push({ label, href: isLast ? null : acc });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <ol className="flex items-center gap-1 flex-wrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span className="material-symbols-outlined text-on-surface-variant text-base" aria-hidden="true">
                  chevron_right
                </span>
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="focus-ring text-on-surface-variant hover:text-primary font-body font-medium px-1 rounded"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="text-primary font-headline font-bold px-1"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
