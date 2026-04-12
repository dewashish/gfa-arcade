"use client";

import { create } from "zustand";
import type { ActivityPacingConfig } from "@/lib/game-engine/types";
import { defaultPacing } from "@/lib/game-engine/types";

/** One activity slot in the class prep tray. */
export interface TrayActivity {
  activity_id: string;
  title: string;
  game_type: string;
  subject: string | null;
  item_count: number;
  pacing: ActivityPacingConfig;
}

interface ClassPrepState {
  // Tray
  open: boolean;
  planId: string | null;
  planName: string;
  activities: TrayActivity[];
  expandedIndex: number | null;
  dirty: boolean;

  // Actions — tray
  toggleTray: () => void;
  openTray: () => void;
  closeTray: () => void;
  setPlanName: (name: string) => void;

  // Actions — activities
  addActivity: (a: Omit<TrayActivity, "pacing">) => void;
  removeActivity: (activityId: string) => void;
  reorderActivities: (from: number, to: number) => void;
  toggleExpanded: (index: number) => void;
  updatePacing: (activityId: string, pacing: Partial<ActivityPacingConfig>) => void;

  // Actions — plan lifecycle
  loadPlan: (planId: string, name: string, activities: TrayActivity[]) => void;
  resetTray: () => void;
}

const initialState = {
  open: false,
  planId: null as string | null,
  planName: "Untitled Class",
  activities: [] as TrayActivity[],
  expandedIndex: null as number | null,
  dirty: false,
};

export const useClassPrepStore = create<ClassPrepState>((set) => ({
  ...initialState,

  toggleTray: () => set((s) => ({ open: !s.open })),
  openTray: () => set({ open: true }),
  closeTray: () => set({ open: false }),
  setPlanName: (name) => set({ planName: name, dirty: true }),

  addActivity: (a) =>
    set((s) => {
      if (s.activities.some((x) => x.activity_id === a.activity_id)) return s;
      return {
        activities: [
          ...s.activities,
          { ...a, pacing: defaultPacing(a.game_type) },
        ],
        open: true,
        dirty: true,
      };
    }),

  removeActivity: (activityId) =>
    set((s) => ({
      activities: s.activities.filter((a) => a.activity_id !== activityId),
      expandedIndex: null,
      dirty: true,
    })),

  reorderActivities: (from, to) =>
    set((s) => {
      const items = [...s.activities];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { activities: items, dirty: true };
    }),

  toggleExpanded: (index) =>
    set((s) => ({
      expandedIndex: s.expandedIndex === index ? null : index,
    })),

  updatePacing: (activityId, partial) =>
    set((s) => ({
      activities: s.activities.map((a) =>
        a.activity_id === activityId
          ? { ...a, pacing: { ...a.pacing, ...partial } }
          : a
      ),
      dirty: true,
    })),

  loadPlan: (planId, name, activities) =>
    set({
      planId,
      planName: name,
      activities,
      open: true,
      dirty: false,
      expandedIndex: null,
    }),

  resetTray: () => set(initialState),
}));
