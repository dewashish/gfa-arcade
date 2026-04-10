import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { GameEvent } from "./types";

export class RealtimeManager {
  private channel: RealtimeChannel | null = null;

  constructor(private supabase: SupabaseClient<Database>) {}

  joinChannel(
    sessionId: string,
    onEvent: (event: GameEvent) => void,
    onLeaderboardChange?: (payload: unknown) => void
  ) {
    // Broadcast channel for game events
    this.channel = this.supabase
      .channel(`game:${sessionId}`)
      .on("broadcast", { event: "game_event" }, (payload) => {
        onEvent(payload.payload as GameEvent);
      });

    // Subscribe to leaderboard changes via postgres_changes
    if (onLeaderboardChange) {
      this.channel = this.channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard_entries",
          filter: `session_id=eq.${sessionId}`,
        },
        onLeaderboardChange
      );
    }

    this.channel.subscribe();
    return this;
  }

  broadcastEvent(event: GameEvent) {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "game_event",
      payload: event,
    });
  }

  leave() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
