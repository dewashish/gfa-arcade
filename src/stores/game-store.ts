"use client";

import { create } from "zustand";
import type { GamePhase, LeaderboardEntry, ActivityConfig } from "@/lib/game-engine/types";

interface GameState {
  // Session
  sessionId: string | null;
  pinCode: string | null;
  studentId: string | null;
  studentName: string | null;
  avatarId: string | null;
  isTeacher: boolean;

  // Game state
  phase: GamePhase;
  config: ActivityConfig | null;
  currentRound: number;
  totalRounds: number;
  myScore: number;
  myStreak: number;
  leaderboard: LeaderboardEntry[];

  // Spin wheel specific
  spinAngle: number;
  spinSegmentIndex: number;

  // Quiz specific
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;

  // Actions
  setSession: (sessionId: string, pinCode: string) => void;
  setStudent: (studentId: string, name: string, avatarId: string) => void;
  setTeacher: (isTeacher: boolean) => void;
  setConfig: (config: ActivityConfig) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentRound: (round: number) => void;
  addScore: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  updateLeaderboardEntry: (entry: LeaderboardEntry) => void;
  setSpinResult: (angle: number, segmentIndex: number) => void;
  setCurrentQuestion: (index: number) => void;
  setSelectedAnswer: (index: number | null) => void;
  setShowResult: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  pinCode: null,
  studentId: null,
  studentName: null,
  avatarId: null,
  isTeacher: false,
  phase: "waiting" as GamePhase,
  config: null,
  currentRound: 0,
  totalRounds: 0,
  myScore: 0,
  myStreak: 0,
  leaderboard: [],
  spinAngle: 0,
  spinSegmentIndex: -1,
  currentQuestionIndex: 0,
  selectedAnswer: null,
  showResult: false,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setSession: (sessionId, pinCode) => set({ sessionId, pinCode }),
  setStudent: (studentId, name, avatarId) =>
    set({ studentId, studentName: name, avatarId }),
  setTeacher: (isTeacher) => set({ isTeacher }),
  setConfig: (config) => {
    const totalRounds =
      config.type === "spin-wheel"
        ? config.rounds
        : config.type === "quiz"
          ? config.questions.length
          : config.type === "match-up"
            ? config.pairs.length
            : 1;
    set({ config, totalRounds });
  },
  setPhase: (phase) => set({ phase }),
  setCurrentRound: (round) => set({ currentRound: round }),
  addScore: (points) => set((s) => ({ myScore: s.myScore + points })),
  incrementStreak: () => set((s) => ({ myStreak: s.myStreak + 1 })),
  resetStreak: () => set({ myStreak: 0 }),
  setLeaderboard: (entries) => set({ leaderboard: entries }),
  updateLeaderboardEntry: (entry) =>
    set((s) => {
      const existing = s.leaderboard.findIndex(
        (e) => e.student_id === entry.student_id
      );
      const updated = [...s.leaderboard];
      if (existing >= 0) {
        updated[existing] = entry;
      } else {
        updated.push(entry);
      }
      updated.sort((a, b) => b.total_score - a.total_score);
      return { leaderboard: updated };
    }),
  setSpinResult: (angle, segmentIndex) =>
    set({ spinAngle: angle, spinSegmentIndex: segmentIndex }),
  setCurrentQuestion: (index) =>
    set({ currentQuestionIndex: index, selectedAnswer: null, showResult: false }),
  setSelectedAnswer: (index) => set({ selectedAnswer: index }),
  setShowResult: (show) => set({ showResult: show }),
  reset: () => set(initialState),
}));
