import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { GameEvent } from "./types";

export class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private subscribed = false;

  constructor(private supabase: SupabaseClient<Database>) {}

  joinChannel(
    sessionId: string,
    onEvent: (event: GameEvent) => void,
    onLeaderboardChange?: (payload: unknown) => void
  ) {
    // Idempotent: bail if this manager already subscribed
    if (this.subscribed) return this;

    const channelName = `game:${sessionId}`;

    // CRITICAL: supabase.channel(name) returns the *existing* channel if one
    // with that name already exists. In React Strict Mode (dev) useEffect runs
    // twice, so the previous mount may have left a subscribed channel behind.
    // Force-remove any existing channel with this name before creating a fresh one.
    const existing = this.supabase.getChannels().find((c) => c.topic === `realtime:${channelName}`);
    if (existing) {
      this.supabase.removeChannel(existing);
    }

    // Build a fresh channel with all bindings registered BEFORE subscribe()
    let channel = this.supabase
      .channel(channelName)
      .on("broadcast", { event: "game_event" }, (payload) => {
        onEvent(payload.payload as GameEvent);
      });

    if (onLeaderboardChange) {
      channel = channel.on(
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

    channel.subscribe();
    this.channel = channel;
    this.subscribed = true;
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
      this.subscribed = false;
    }
  }
}
