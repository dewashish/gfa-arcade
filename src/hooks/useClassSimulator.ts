"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * In-browser class simulator.
 *
 * Lets a teacher fake N students joining their session and answering
 * questions over time, so they can test the full live flow without
 * needing real students.
 *
 * Spawns fakes with realistic names + avatars, inserts them into
 * `students`, `session_participants`, and `leaderboard_entries`, then
 * loops `game_scores` inserts at random intervals so the leaderboard
 * trigger fires and rank changes propagate via realtime.
 */

const FAKE_ROSTER: Array<{ name: string; avatar_id: string }> = [
  { name: "Sarah J.", avatar_id: "lion" },
  { name: "Leo W.", avatar_id: "dog" },
  { name: "Amir K.", avatar_id: "fox" },
  { name: "Mia T.", avatar_id: "unicorn" },
  { name: "Noah R.", avatar_id: "rocket" },
  { name: "Chloe C.", avatar_id: "panda" },
  { name: "Oliver S.", avatar_id: "robot" },
  { name: "Aisha M.", avatar_id: "cat" },
  { name: "Hassan Q.", avatar_id: "dragon" },
  { name: "Zara A.", avatar_id: "star" },
  { name: "Yusuf B.", avatar_id: "owl" },
  { name: "Layla H.", avatar_id: "bunny" },
];

export interface SimulatedStudent {
  id: string;
  name: string;
  avatar_id: string;
}

interface SimulatorState {
  running: boolean;
  joined: SimulatedStudent[];
  scoreEvents: number;
  error: string | null;
}

export function useClassSimulator(sessionId: string | null) {
  const [state, setState] = useState<SimulatorState>({
    running: false,
    joined: [],
    scoreEvents: 0,
    error: null,
  });
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  /** Join N fake students into the session. */
  const joinStudents = useCallback(
    async (count: number): Promise<SimulatedStudent[]> => {
      if (!sessionId) return [];
      const supabase = supabaseRef.current;
      const roster = FAKE_ROSTER.slice(0, count);
      const created: SimulatedStudent[] = [];

      for (const fake of roster) {
        const { data: student, error } = await supabase
          .from("students")
          .insert({ name: fake.name, avatar_id: fake.avatar_id })
          .select()
          .single();
        if (error || !student) {
          console.warn(`Failed to create ${fake.name}:`, error?.message);
          continue;
        }
        await supabase
          .from("session_participants")
          .insert({ session_id: sessionId, student_id: student.id });
        await supabase
          .from("leaderboard_entries")
          .insert({
            session_id: sessionId,
            student_id: student.id,
            total_score: 0,
            rank: 0,
          });
        created.push({ id: student.id, name: student.name, avatar_id: student.avatar_id });
      }
      return created;
    },
    [sessionId]
  );

  /** Start the score loop. Picks random students and inserts game_scores. */
  const startScoring = useCallback(
    (students: SimulatedStudent[], tickMs: number) => {
      if (!sessionId || students.length === 0) return;
      const supabase = supabaseRef.current;
      let qIndex = 0;

      tickRef.current = setInterval(async () => {
        // Pick 1-3 students this tick to make it lively
        const burstSize = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < burstSize; i++) {
          const student = students[Math.floor(Math.random() * students.length)];
          const isCorrect = Math.random() > 0.18;
          const baseScore = isCorrect ? 800 + Math.floor(Math.random() * 600) : 0;
          const streakBonus = isCorrect && Math.random() > 0.6 ? Math.floor(baseScore * 0.3) : 0;
          const score = baseScore + streakBonus;

          await supabase.from("game_scores").insert({
            session_id: sessionId,
            student_id: student.id,
            score,
            question_index: qIndex,
            is_correct: isCorrect,
            time_taken_ms: 1500 + Math.floor(Math.random() * 6000),
          });
        }
        qIndex++;
        setState((s) => ({ ...s, scoreEvents: s.scoreEvents + burstSize }));
      }, tickMs);
    },
    [sessionId]
  );

  /** Public: spawn N fakes and start the loop. */
  const start = useCallback(
    async (count = 8, tickMs = 900) => {
      if (!sessionId) {
        setState((s) => ({ ...s, error: "No session ID" }));
        return;
      }
      setState({ running: true, joined: [], scoreEvents: 0, error: null });
      try {
        const joined = await joinStudents(count);
        if (joined.length === 0) {
          setState({ running: false, joined: [], scoreEvents: 0, error: "Failed to join students" });
          return;
        }
        setState((s) => ({ ...s, joined }));
        startScoring(joined, tickMs);
      } catch (e) {
        setState((s) => ({
          ...s,
          running: false,
          error: e instanceof Error ? e.message : "Failed to start simulator",
        }));
      }
    },
    [sessionId, joinStudents, startScoring]
  );

  /** Public: stop the loop and clean up the fake students. */
  const stop = useCallback(
    async (cleanup = true) => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (cleanup && sessionId) {
        const supabase = supabaseRef.current;
        for (const s of state.joined) {
          await supabase
            .from("leaderboard_entries")
            .delete()
            .eq("session_id", sessionId)
            .eq("student_id", s.id);
          await supabase.from("game_scores").delete().eq("session_id", sessionId).eq("student_id", s.id);
          await supabase
            .from("session_participants")
            .delete()
            .eq("session_id", sessionId)
            .eq("student_id", s.id);
          await supabase.from("students").delete().eq("id", s.id);
        }
      }
      setState({ running: false, joined: [], scoreEvents: 0, error: null });
    },
    [sessionId, state.joined]
  );

  return { ...state, start, stop };
}
