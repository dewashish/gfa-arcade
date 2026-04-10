"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeManager } from "@/lib/game-engine/realtime";
import { useGameStore } from "@/stores/game-store";
import { LiveLeaderboard } from "@/components/shared/LiveLeaderboard";

interface Props {
  sessionId: string;
}

export function LeaderboardClient({ sessionId }: Props) {
  const store = useGameStore();
  const realtimeRef = useRef<RealtimeManager | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function fetchLeaderboard() {
      // Direct query bypasses get_session_leaderboard RPC which joins
      // session_participants (no anon SELECT policy). Both leaderboard_entries
      // and students have anon SELECT, so this works for everyone.
      const { data: entries } = await supabase
        .from("leaderboard_entries")
        .select("student_id, total_score, students(name, avatar_id)")
        .eq("session_id", sessionId)
        .order("total_score", { ascending: false });

      if (!entries) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = entries.map((e: any, idx: number) => ({
        student_id: e.student_id,
        student_name: e.students?.name ?? "Player",
        avatar_id: e.students?.avatar_id ?? "cat",
        total_score: e.total_score ?? 0,
        rank: idx + 1,
      }));
      store.setLeaderboard(mapped);
    }

    fetchLeaderboard();

    const rtm = new RealtimeManager(supabase);
    realtimeRef.current = rtm;
    rtm.joinChannel(sessionId, () => {}, () => {
      fetchLeaderboard();
    });

    return () => realtimeRef.current?.leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div
      className="min-h-screen p-6 md:p-12"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(0, 98, 158, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(254, 183, 0, 0.06) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <LiveLeaderboard variant="full" />
      </div>
    </div>
  );
}
