"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClassSimulator } from "@/hooks/useClassSimulator";
import { SPRING, TRANSITION } from "@/lib/design/motion";

interface SimulateClassButtonProps {
  sessionId: string;
}

/**
 * Teacher-side dev tool. Lets the teacher spawn fake students and
 * a continuous score loop without leaving the Monitor view.
 *
 * Use case: demoing or testing the live class flow without real
 * students. Spawned students are real Supabase rows; the cleanup
 * removes them on Stop.
 */
export function SimulateClassButton({ sessionId }: SimulateClassButtonProps) {
  const sim = useClassSimulator(sessionId);
  const [count, setCount] = useState(8);
  const [tickMs, setTickMs] = useState(900);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {!sim.running ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="focus-ring h-11 px-4 rounded-full bg-surface-container-low text-on-surface font-headline font-bold text-sm inline-flex items-center gap-2 hover:bg-surface-container transition-colors"
          aria-label="Simulate class"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            science
          </span>
          Simulate Class
        </button>
      ) : (
        <button
          onClick={() => sim.stop()}
          className="focus-ring h-11 px-4 rounded-full bg-error text-white font-headline font-bold text-sm inline-flex items-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-base animate-pulse" aria-hidden="true">
            stop_circle
          </span>
          Stop Sim ({sim.joined.length} fakes · {sim.scoreEvents} answers)
        </button>
      )}

      <AnimatePresence>
        {open && !sim.running && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={SPRING.snappy}
            role="dialog"
            aria-label="Simulate class options"
            className="absolute right-0 top-14 z-50 w-72 bg-white rounded-xl ambient-shadow-lg p-5 space-y-4"
          >
            <div>
              <p className="font-headline font-black text-on-surface mb-1">Fake a class</p>
              <p className="text-xs text-on-surface-variant font-body">
                Spawns fake students that join and start answering automatically. Cleans them up
                when you stop.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block">
                Students
              </label>
              <input
                type="range"
                min={2}
                max={12}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Number of students"
              />
              <p className="text-sm font-body font-bold text-on-surface">{count}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block">
                Speed
              </label>
              <div className="flex gap-2">
                {[
                  { label: "Slow", value: 1500 },
                  { label: "Normal", value: 900 },
                  { label: "Fast", value: 500 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTickMs(opt.value)}
                    className={`focus-ring flex-1 h-10 rounded-full text-xs font-headline font-bold transition-colors ${tickMs === opt.value ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                sim.start(count, tickMs);
              }}
              className="focus-ring w-full h-11 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-black inline-flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                play_arrow
              </span>
              Start Simulation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {sim.error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={TRANSITION.fast}
          role="alert"
          className="absolute right-0 top-14 text-xs text-error font-body bg-error-container px-3 py-2 rounded-lg"
        >
          {sim.error}
        </motion.p>
      )}
    </div>
  );
}
