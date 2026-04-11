"use client";

import { motion } from "framer-motion";
import type { TrendPoint } from "@/app/(teacher)/reports/page";

/**
 * 14-day engagement trend chart — pure SVG, no chart library.
 *
 * Each bar represents one calendar day. Height scales to the max
 * value in the series so a single-session day doesn't look like a
 * flat line next to a 10-session day. Bars animate up from the
 * baseline on mount with a staggered spring.
 *
 * Reduced motion is honoured automatically via ReducedMotionProvider
 * at the app root.
 */

interface Props {
  data: TrendPoint[];
}

export function EngagementTrendChart({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.sessions));
  const barHeightPct = (n: number) => (n / max) * 100;
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const busiestDay = data.reduce(
    (best, d) => (d.sessions > best.sessions ? d : best),
    data[0] ?? { day: "", label: "", sessions: 0 }
  );

  return (
    <section className="rounded-[28px] bg-surface-container-lowest ambient-shadow p-5 md:p-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="font-headline font-black text-lg md:text-xl text-on-surface">
            Engagement Trend
          </h2>
          <p className="text-xs font-body text-on-surface-variant mt-1">
            Sessions run in the last 14 days
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-headline font-black text-2xl text-primary">
            {totalSessions}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            total
          </p>
        </div>
      </div>

      {/* Bars — one column per day */}
      <div className="flex items-end justify-between gap-1 md:gap-2 h-40">
        {data.map((d, i) => {
          const pct = d.sessions > 0 ? barHeightPct(d.sessions) : 0;
          const isBusiest = d.sessions === busiestDay.sessions && d.sessions > 0;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 group"
            >
              {/* Value label above bar when > 0 */}
              {d.sessions > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="text-[10px] font-headline font-black text-on-surface-variant"
                >
                  {d.sessions}
                </motion.span>
              )}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: `${pct > 0 ? Math.max(pct, 4) : 2}%`,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                  delay: i * 0.03,
                }}
                className={`w-full rounded-t-lg ${
                  d.sessions === 0
                    ? "bg-surface-container-high"
                    : isBusiest
                      ? "bg-gradient-to-t from-secondary to-secondary-container shadow-md shadow-secondary/20"
                      : "bg-gradient-to-t from-primary to-primary-container"
                }`}
                title={`${d.label}: ${d.sessions} session${d.sessions === 1 ? "" : "s"}`}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis day labels — show every other one on narrow screens */}
      <div className="flex justify-between gap-1 md:gap-2 mt-2">
        {data.map((d, i) => (
          <span
            key={`label-${d.day}`}
            className={`flex-1 text-center text-[9px] md:text-[10px] font-body text-on-surface-variant min-w-0 truncate ${
              i % 2 !== 0 ? "hidden sm:block" : ""
            }`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </section>
  );
}
