"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { createGameSession } from "@/lib/game-engine/session-manager";
import { KineticHeadline } from "@/components/ui/KineticHeadline";
import { SubjectChip } from "@/components/bank/SubjectChip";
import { BankCard } from "@/components/bank/BankCard";
import { PreviewModal } from "@/components/bank/PreviewModal";
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from "@/lib/bank/imagery";
import { GAME_TYPE_LABELS, type BankActivity } from "@/lib/bank/types";
import { STAGGER, TRANSITION } from "@/lib/design/motion";

interface Props {
  templates: BankActivity[];
  fetchError: string | null;
}

const GAME_TYPES = ["quiz", "spin-wheel", "match-up", "flashcards", "group-sort"];

export function BankClient({ templates, fetchError }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state — synced to URL params per ui-ux-pro-max state-preservation rule
  const subjectParam = (searchParams.get("subject") ?? "all") as SubjectKey | "all";
  const gameTypeParam = searchParams.get("type") ?? "all";

  const [previewItem, setPreviewItem] = useState<BankActivity | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function setFilter(key: "subject" | "type", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.replace(`/bank${params.toString() ? `?${params}` : ""}`, { scroll: false });
    });
  }

  // Counts per subject (across all game types) for chip badges
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    for (const t of templates) {
      const key = t.subject ?? "other";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [templates]);

  // Apply filters
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (subjectParam !== "all" && t.subject !== subjectParam) return false;
      if (gameTypeParam !== "all" && t.game_type !== gameTypeParam) return false;
      return true;
    });
  }, [templates, subjectParam, gameTypeParam]);

  async function handleUse(activity: BankActivity) {
    setLaunchingId(activity.id);
    setLaunchError(null);
    try {
      const supabase = createClient();
      const session = await createGameSession(supabase, activity.id);
      router.push(`/session/${session.id}`);
    } catch (e) {
      setLaunchError(
        e instanceof Error
          ? e.message
          : "Something went wrong starting your game. Please try again."
      );
      setLaunchingId(null);
    }
  }

  // ===== Empty / error states =====
  if (fetchError) {
    return (
      <div className="space-y-6">
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Activity Bank
        </KineticHeadline>
        <div className="bg-error-container rounded-xl p-6 text-on-error-container">
          <p className="font-headline font-bold mb-2">Couldn&apos;t load the bank</p>
          <p className="text-sm font-body">{fetchError}</p>
          <p className="text-sm font-body mt-3">
            If you haven&apos;t run <code className="bg-white/40 px-1.5 py-0.5 rounded">supabase-bank.sql</code> yet,
            run it in the Supabase SQL editor first.
          </p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Activity Bank
        </KineticHeadline>
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <div className="text-7xl mb-4" aria-hidden="true">📦</div>
          <p className="font-headline font-bold text-xl text-on-surface mb-2">
            The bank is empty
          </p>
          <p className="text-on-surface-variant font-body">
            Run the seed script to populate ready-made activities:
          </p>
          <pre className="bg-surface-container-lowest rounded-lg p-3 mt-3 text-xs text-on-surface-variant inline-block">
            node scripts/seed-bank.mjs
          </pre>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: STAGGER.base, delayChildren: 0.05 } },
      }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Activity <span className="text-primary-container">Bank</span>
        </KineticHeadline>
        <p className="text-on-surface-variant font-body mt-2 text-lg">
          {templates.length} ready-made activities, aligned to the UK Year 1 curriculum.
          Tap <span className="text-primary font-bold">Use in class</span> to launch one straight into a live session.
        </p>
      </motion.div>

      {/* Subject filter row */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="space-y-3"
      >
        <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
          Subject
        </p>
        <div className="flex flex-wrap gap-2">
          <SubjectChip
            active={subjectParam === "all"}
            onClick={() => setFilter("subject", "all")}
            label="All Subjects"
            emoji="✨"
            count={subjectCounts.all}
            tone="all"
          />
          {SUBJECT_KEYS.map((key) => {
            const meta = SUBJECT_META[key];
            return (
              <SubjectChip
                key={key}
                active={subjectParam === key}
                onClick={() => setFilter("subject", key)}
                label={meta.label}
                emoji={meta.emoji}
                count={subjectCounts[key] ?? 0}
                tone={key}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Game type filter row */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="space-y-3"
      >
        <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
          Game Type
        </p>
        <div className="flex flex-wrap gap-2">
          <SubjectChip
            active={gameTypeParam === "all"}
            onClick={() => setFilter("type", "all")}
            label="All Games"
            emoji="🎮"
            tone="all"
          />
          {GAME_TYPES.map((type) => {
            const info = GAME_TYPE_LABELS[type] ?? { label: type, emoji: "🎮" };
            return (
              <SubjectChip
                key={type}
                active={gameTypeParam === type}
                onClick={() => setFilter("type", type)}
                label={info.label}
                emoji={info.emoji}
                tone="all"
              />
            );
          })}
        </div>
      </motion.div>

      {/* Launch error toast */}
      {launchError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TRANSITION.fast}
          role="alert"
          className="bg-error-container text-on-error-container rounded-xl p-4 flex items-start gap-3"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            error
          </span>
          <div className="flex-1">
            <p className="font-headline font-bold">Couldn&apos;t start the game</p>
            <p className="text-sm font-body">{launchError}</p>
          </div>
          <button
            onClick={() => setLaunchError(null)}
            className="focus-ring text-on-error-container hover:bg-white/20 rounded-full p-1"
            aria-label="Dismiss error"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </motion.div>
      )}

      {/* Results count */}
      <p className="text-sm text-on-surface-variant font-body">
        Showing <strong>{filtered.length}</strong> of {templates.length} activities
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
          <p className="font-headline font-bold text-xl text-on-surface mb-2">
            Nothing matches that filter
          </p>
          <p className="text-on-surface-variant font-body">
            Try a different subject or game type.
          </p>
          <button
            onClick={() => router.replace("/bank", { scroll: false })}
            className="focus-ring mt-4 px-6 h-11 rounded-full bg-primary text-white font-headline font-bold inline-flex items-center gap-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((activity, idx) => (
            <BankCard
              key={activity.id}
              activity={activity}
              index={idx}
              onPreview={setPreviewItem}
              onUse={handleUse}
              isLaunching={launchingId === activity.id}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      <PreviewModal
        activity={previewItem}
        onClose={() => setPreviewItem(null)}
        onUse={(a) => {
          setPreviewItem(null);
          handleUse(a);
        }}
        isLaunching={launchingId !== null && launchingId === previewItem?.id}
      />
    </motion.div>
  );
}
