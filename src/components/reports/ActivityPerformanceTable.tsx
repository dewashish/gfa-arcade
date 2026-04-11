"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SubjectMascot } from "@/components/bank/SubjectMascot";
import type { SubjectKey } from "@/lib/bank/imagery";
import type { ReportActivityStat } from "@/app/(teacher)/reports/page";

/**
 * Sortable per-activity performance table.
 *
 * Columns: mascot thumbnail · title · runs · avg score · accuracy.
 * Click any column header to sort. Default sort is by runs desc.
 *
 * Reuses SubjectMascot built in Phase 1 so every row gets a
 * subject-appropriate illustration on the left — no extra assets.
 */

type SortKey = "title" | "runs" | "avg_score" | "accuracy_pct";

interface Props {
  data: ReportActivityStat[];
}

export function ActivityPerformanceTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("runs");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title") return a.title.localeCompare(b.title) * dir;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "title" ? "asc" : "desc");
    }
  }

  function accuracyColor(pct: number) {
    if (pct >= 80) return "text-tertiary";
    if (pct >= 60) return "text-primary";
    if (pct >= 40) return "text-secondary";
    return "text-error";
  }

  return (
    <section className="rounded-[28px] bg-surface-container-lowest ambient-shadow p-5 md:p-6">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="font-headline font-black text-lg md:text-xl text-on-surface">
            Per-Activity Performance
          </h2>
          <p className="text-xs font-body text-on-surface-variant mt-1">
            How each activity is landing with the class
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center font-body text-on-surface-variant py-8">
          No activities run yet.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest font-headline font-black text-on-surface-variant">
                <th className="text-left py-2 px-2">Activity</th>
                <SortableTh
                  label="Runs"
                  active={sortKey === "runs"}
                  dir={sortDir}
                  onClick={() => toggleSort("runs")}
                />
                <SortableTh
                  label="Avg Pts"
                  active={sortKey === "avg_score"}
                  dir={sortDir}
                  onClick={() => toggleSort("avg_score")}
                />
                <SortableTh
                  label="Accuracy"
                  active={sortKey === "accuracy_pct"}
                  dir={sortDir}
                  onClick={() => toggleSort("accuracy_pct")}
                />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <motion.tr
                  key={row.activity_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-primary-container/10 flex items-center justify-center overflow-visible">
                        <SubjectMascot
                          subject={(row.subject ?? "maths") as SubjectKey}
                          hover={false}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline font-bold text-on-surface truncate">
                          {row.title}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                          {row.subject ?? "—"} · {row.game_type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-headline font-black text-lg text-on-surface">
                      {row.runs}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-headline font-black text-lg text-primary">
                      {row.avg_score.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`font-headline font-black text-lg ${accuracyColor(row.accuracy_pct)}`}
                    >
                      {row.accuracy_pct}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="text-right py-2 px-2">
      <button
        type="button"
        onClick={onClick}
        className={`focus-ring inline-flex items-center gap-1 transition-colors ${
          active ? "text-primary" : "hover:text-primary"
        }`}
      >
        {label}
        <span className="material-symbols-outlined text-[14px]">
          {active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
        </span>
      </button>
    </th>
  );
}
