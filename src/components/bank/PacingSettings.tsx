"use client";

import { motion } from "framer-motion";
import type { ActivityPacingConfig, TimerMode } from "@/lib/game-engine/types";

interface Props {
  pacing: ActivityPacingConfig;
  onChange: (partial: Partial<ActivityPacingConfig>) => void;
}

const TIMER_MODES: { value: TimerMode; label: string; icon: string }[] = [
  { value: "per-question", label: "Per Question", icon: "timer" },
  { value: "overall", label: "Overall", icon: "hourglass_top" },
  { value: "none", label: "No Timer", icon: "timer_off" },
];

export function PacingSettings({ pacing, onChange }: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="overflow-hidden"
    >
      <div className="pt-3 pb-1 space-y-4">
        {/* Timer Mode */}
        <div>
          <p className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
            Timer Mode
          </p>
          <div className="flex bg-surface-container rounded-full p-1 gap-0.5">
            {TIMER_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => onChange({ timer_mode: m.value })}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-headline font-bold transition-all ${
                  pacing.timer_mode === m.value
                    ? "bg-gradient-to-r from-primary to-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer seconds (only when timer is enabled) */}
        {pacing.timer_mode !== "none" && (
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
              {pacing.timer_mode === "per-question" ? "Seconds per question" : "Total minutes"}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    timer_seconds: Math.max(
                      5,
                      pacing.timer_seconds - (pacing.timer_mode === "overall" ? 30 : 5)
                    ),
                  })
                }
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <div className="flex-1 text-center">
                <span className="font-headline font-black text-2xl text-on-surface">
                  {pacing.timer_mode === "overall"
                    ? `${Math.round(pacing.timer_seconds / 60)}`
                    : pacing.timer_seconds}
                </span>
                <span className="text-xs text-on-surface-variant ml-1 font-body">
                  {pacing.timer_mode === "overall" ? "min" : "sec"}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    timer_seconds:
                      pacing.timer_seconds + (pacing.timer_mode === "overall" ? 30 : 5),
                  })
                }
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle switches */}
        <div className="space-y-2.5">
          <ToggleRow
            label="Auto-advance when timer expires"
            checked={pacing.auto_advance}
            disabled={pacing.timer_mode === "none"}
            onChange={(v) => onChange({ auto_advance: v })}
          />
          <ToggleRow
            label="Teacher can skip ahead"
            checked={pacing.teacher_can_skip}
            onChange={(v) => onChange({ teacher_can_skip: v })}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-2 py-1 cursor-pointer ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <span className="text-xs font-body text-on-surface">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-tertiary-container" : "bg-surface-container-highest"
        }`}
      >
        <motion.span
          layout
          className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${
            checked ? "bg-on-tertiary-container" : "bg-outline"
          }`}
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </label>
  );
}

/** Compact one-liner when the pacing section is collapsed. */
export function PacingSummary({ pacing }: { pacing: ActivityPacingConfig }) {
  if (pacing.timer_mode === "none") {
    return (
      <span className="text-[10px] text-on-surface-variant font-body">
        No timer · Manual pacing
      </span>
    );
  }
  const time =
    pacing.timer_mode === "per-question"
      ? `${pacing.timer_seconds}s per Q`
      : `${Math.round(pacing.timer_seconds / 60)}min total`;
  return (
    <span className="text-[10px] text-on-surface-variant font-body">
      ⏱ {time}{pacing.auto_advance ? " · Auto-advance" : ""}
    </span>
  );
}
