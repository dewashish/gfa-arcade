"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING, TRANSITION } from "@/lib/design/motion";
import { SUBJECT_META, type SubjectKey } from "@/lib/bank/imagery";
import { GAME_TYPE_LABELS, countActivityItems, type BankActivity } from "@/lib/bank/types";
import type { QuizConfig, MatchUpConfig, FlashCardsConfig } from "@/lib/game-engine/types";

interface PreviewModalProps {
  activity: BankActivity | null;
  onClose: () => void;
  onUse: (activity: BankActivity) => void;
  isLaunching: boolean;
}

export function PreviewModal({ activity, onClose, onUse, isLaunching }: PreviewModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape key + initial focus
  useEffect(() => {
    if (!activity) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activity, onClose]);

  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSITION.fast}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-8 glass-panel"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={SPRING.snappy}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-t-[2rem] md:rounded-xl ambient-shadow-lg w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <ModalContent
              activity={activity}
              onClose={onClose}
              onUse={onUse}
              isLaunching={isLaunching}
              closeRef={closeRef}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  activity,
  onClose,
  onUse,
  isLaunching,
  closeRef,
}: {
  activity: BankActivity;
  onClose: () => void;
  onUse: (activity: BankActivity) => void;
  isLaunching: boolean;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const subjectKey = (activity.subject ?? "maths") as SubjectKey;
  const meta = SUBJECT_META[subjectKey] ?? SUBJECT_META.maths;
  const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? { label: activity.game_type, emoji: "🎮" };
  const itemCount = countActivityItems(activity.config_json);

  return (
    <>
      {/* Header */}
      <div
        className="px-6 py-6 text-white relative shrink-0"
        style={{
          background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
        }}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close preview"
          className="focus-ring absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase">
            {meta.label}
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
            <span aria-hidden="true">{gameInfo.emoji}</span>
            {gameInfo.label}
          </div>
        </div>

        <h2 id="preview-title" className="font-headline font-black text-3xl leading-tight">
          {activity.title}
        </h2>
        {activity.description && (
          <p className="text-white/90 mt-2 font-body">{activity.description}</p>
        )}
      </div>

      {/* Body — preview of items */}
      <div className="px-6 py-5 overflow-y-auto flex-1">
        <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-3">
          {itemCount} {itemCount === 1 ? "item" : "items"} included
        </p>
        <ItemPreview activity={activity} />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-surface-container-low flex gap-3 shrink-0">
        <button
          onClick={onClose}
          disabled={isLaunching}
          className="focus-ring h-12 px-6 rounded-full bg-surface-container-lowest text-on-surface font-headline font-bold transition-colors hover:bg-surface-container disabled:opacity-50"
        >
          Close
        </button>
        <button
          onClick={() => onUse(activity)}
          disabled={isLaunching}
          className="focus-ring flex-1 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-black inline-flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isLaunching ? (
            <>
              <span className="material-symbols-outlined animate-spin" aria-hidden="true">
                progress_activity
              </span>
              Starting your game...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" aria-hidden="true">
                play_arrow
              </span>
              Use in class
            </>
          )}
        </button>
      </div>
    </>
  );
}

function ItemPreview({ activity }: { activity: BankActivity }) {
  const cfg = activity.config_json;

  if (cfg.type === "quiz") {
    const quiz = cfg as QuizConfig;
    return (
      <ol className="space-y-3">
        {quiz.questions.slice(0, 5).map((q, i) => (
          <li key={i} className="bg-surface-container-low rounded-2xl p-4">
            <p className="font-body font-bold text-on-surface mb-2">
              {i + 1}. {q.question}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div
                  key={oi}
                  className={`text-sm px-3 py-1.5 rounded-full font-medium ${oi === q.correct_index ? "bg-tertiary-container/30 text-tertiary font-bold" : "bg-surface-container-lowest text-on-surface-variant"}`}
                >
                  {oi === q.correct_index && (
                    <span className="material-symbols-outlined text-xs mr-1" aria-hidden="true">
                      check
                    </span>
                  )}
                  {opt}
                </div>
              ))}
            </div>
          </li>
        ))}
        {quiz.questions.length > 5 && (
          <li className="text-center text-sm text-on-surface-variant font-body">
            + {quiz.questions.length - 5} more question{quiz.questions.length - 5 === 1 ? "" : "s"}
          </li>
        )}
      </ol>
    );
  }

  if (cfg.type === "match-up") {
    const match = cfg as MatchUpConfig;
    return (
      <div className="grid grid-cols-2 gap-3">
        {match.pairs.slice(0, 6).map((p, i) => (
          <div key={i} className="bg-surface-container-low rounded-2xl p-3 flex flex-col gap-1 text-sm">
            <span className="font-headline font-bold text-on-surface">{p.term}</span>
            <span className="text-on-surface-variant">↔ {p.definition}</span>
          </div>
        ))}
        {match.pairs.length > 6 && (
          <div className="col-span-2 text-center text-sm text-on-surface-variant">
            + {match.pairs.length - 6} more
          </div>
        )}
      </div>
    );
  }

  if (cfg.type === "flashcards") {
    const fc = cfg as FlashCardsConfig;
    return (
      <div className="grid grid-cols-2 gap-3">
        {fc.cards.slice(0, 6).map((c, i) => (
          <div key={i} className="bg-surface-container-low rounded-2xl p-3 text-center">
            <p className="font-headline font-black text-lg text-on-surface">{c.front}</p>
            <p className="text-xs text-on-surface-variant mt-1">{c.back}</p>
          </div>
        ))}
      </div>
    );
  }

  if (cfg.type === "spin-wheel") {
    return (
      <div className="flex flex-wrap gap-2">
        {cfg.segments.map((s, i) => (
          <span
            key={i}
            className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface font-headline font-bold text-sm"
          >
            {s.label}
          </span>
        ))}
      </div>
    );
  }

  if (cfg.type === "group-sort") {
    return (
      <div className="space-y-3">
        {cfg.groups.map((g, i) => (
          <div key={i} className="bg-surface-container-low rounded-2xl p-3">
            <p className="font-headline font-bold text-on-surface mb-2">{g.name}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item, ii) => (
                <span key={ii} className="px-3 py-1 rounded-full bg-surface-container-lowest text-sm text-on-surface-variant font-body">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm text-on-surface-variant font-body">
      Preview not available for this game type. Tap &quot;Use in class&quot; to start playing.
    </p>
  );
}
