"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { useClassPrepStore, type TrayActivity } from "@/stores/class-prep-store";
import { PacingSettings, PacingSummary } from "./PacingSettings";
import { GAME_TYPE_LABELS } from "@/lib/bank/types";
import { SUBJECT_META, type SubjectKey } from "@/lib/bank/imagery";
import type { ClassPlanActivity } from "@/lib/game-engine/types";

export function ClassPrepTray() {
  const store = useClassPrepStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = store.activities.findIndex((a) => a.activity_id === active.id);
    const newIdx = store.activities.findIndex((a) => a.activity_id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      store.reorderActivities(oldIdx, newIdx);
    }
  }

  /** Saves the plan and returns the plan ID. */
  async function handleSavePlan(): Promise<string> {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const planActivities: ClassPlanActivity[] = store.activities.map((a, i) => ({
        activity_id: a.activity_id,
        pacing: a.pacing,
        order: i,
      }));

      if (store.planId) {
        const { error: err } = await supabase
          .from("class_plans")
          .update({
            name: store.planName,
            activities: planActivities as unknown as Record<string, unknown>[],
            updated_at: new Date().toISOString(),
          })
          .eq("id", store.planId);
        if (err) throw err;
        return store.planId;
      } else {
        const { data, error: err } = await supabase
          .from("class_plans")
          .insert({
            teacher_id: user.id,
            name: store.planName,
            activities: planActivities as unknown as Record<string, unknown>[],
          })
          .select("id")
          .single();
        if (err) throw err;
        if (!data) throw new Error("No plan returned after save");
        store.loadPlan(data.id, store.planName, store.activities);
        return data.id;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setError(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function handleLaunchPlaylist() {
    if (store.activities.length === 0) return;
    setLaunching(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save plan first — always save to get a guaranteed plan ID
      const planId = await handleSavePlan();

      // Create playlist sessions linked to this plan
      const { createPlaylistSession } = await import("@/lib/game-engine/session-manager");
      const firstSession = await createPlaylistSession(
        supabase,
        store.activities,
        planId
      );

      startTransition(() => {
        router.push(`/session/${firstSession.id}`);
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Launch failed";
      setError(msg);
      setLaunching(false);
    }
  }

  if (!store.open) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={store.openTray}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-b from-primary to-primary-container text-white p-3 rounded-l-2xl shadow-lg hover:pr-5 transition-all"
        title="Open Class Prep tray"
      >
        <span className="material-symbols-outlined">playlist_add</span>
        {store.activities.length > 0 && (
          <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center justify-center shadow">
            {store.activities.length}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[380px] shrink-0 bg-surface-container-low rounded-l-[28px] flex flex-col h-full max-h-[calc(100vh-6rem)] sticky top-24 shadow-[−20px_0_40px_rgba(0,98,158,0.08)]"
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-black text-lg text-on-surface">
            Class Plan
          </h2>
          <button
            onClick={store.closeTray}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-base text-on-surface-variant">
              chevron_right
            </span>
          </button>
        </div>
        <input
          type="text"
          value={store.planName}
          onChange={(e) => store.setPlanName(e.target.value)}
          placeholder="Plan name..."
          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-outline-variant"
        />
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        {store.activities.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3">📋</span>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">
              No activities yet
            </p>
            <p className="text-xs text-on-surface-variant font-body">
              Click <strong>+</strong> on any activity card to add it
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={store.activities.map((a) => a.activity_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {store.activities.map((activity, idx) => (
                  <SortableTrayItem
                    key={activity.activity_id}
                    activity={activity}
                    index={idx}
                    expanded={store.expandedIndex === idx}
                    onToggle={() => store.toggleExpanded(idx)}
                    onRemove={() => store.removeActivity(activity.activity_id)}
                    onPacingChange={(p) =>
                      store.updatePacing(activity.activity_id, p)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-xl bg-error-container text-on-error-container text-xs font-body">
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="p-5 pt-3 space-y-2 border-t border-outline-variant/10">
        <div className="flex gap-2">
          <button
            onClick={handleSavePlan}
            disabled={saving || store.activities.length === 0}
            className="flex-1 h-11 rounded-full bg-surface-container-lowest text-on-surface font-headline font-bold text-sm ambient-shadow hover:bg-surface-container-high transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-base">save</span>
            )}
            Save Plan
          </button>
          <button
            onClick={handleLaunchPlaylist}
            disabled={launching || store.activities.length === 0}
            className="flex-[1.4] h-11 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm shadow-md hover:shadow-lg transition-shadow disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {launching ? (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-base">rocket_launch</span>
            )}
            Launch Class
          </button>
        </div>
        <p className="text-[10px] text-center text-on-surface-variant font-body">
          {store.activities.length} activit{store.activities.length === 1 ? "y" : "ies"}
          {store.dirty ? " · Unsaved changes" : ""}
        </p>
      </div>
    </motion.aside>
  );
}

// ===== Sortable tray item =====

function SortableTrayItem({
  activity,
  index,
  expanded,
  onToggle,
  onRemove,
  onPacingChange,
}: {
  activity: TrayActivity;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onPacingChange: (p: Partial<TrayActivity["pacing"]>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.activity_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? { label: activity.game_type, emoji: "🎮" };
  const subjectMeta = SUBJECT_META[(activity.subject ?? "maths") as SubjectKey];
  const dotColor = subjectMeta?.gradient[1] ?? "#999";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`bg-surface-container-lowest rounded-2xl p-3 transition-shadow ${
        isDragging ? "shadow-xl" : "shadow-sm"
      }`}
    >
      {/* Compact row */}
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing p-1 text-outline-variant hover:text-on-surface-variant"
          aria-label="Drag to reorder"
        >
          <span className="material-symbols-outlined text-base">drag_indicator</span>
        </button>

        {/* Order number */}
        <span className="w-5 h-5 rounded-full bg-surface-container text-[10px] font-headline font-bold text-on-surface-variant flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        {/* Content — click to expand */}
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-headline font-bold text-on-surface truncate">
            {activity.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <span className="text-[10px] text-on-surface-variant font-body">
              {gameInfo.emoji} {gameInfo.label}
            </span>
            <span className="text-[10px] text-outline-variant">·</span>
            <PacingSummary pacing={activity.pacing} />
          </div>
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="shrink-0 w-7 h-7 rounded-full hover:bg-error-container flex items-center justify-center transition-colors"
          aria-label={`Remove ${activity.title}`}
        >
          <span className="material-symbols-outlined text-sm text-on-surface-variant hover:text-error">
            close
          </span>
        </button>
      </div>

      {/* Expanded pacing settings */}
      <AnimatePresence>
        {expanded && (
          <PacingSettings pacing={activity.pacing} onChange={onPacingChange} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
