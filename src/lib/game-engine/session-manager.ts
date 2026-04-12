import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createGameSession(
  supabase: SupabaseClient<Database>,
  activityId: string
) {
  // Get the current teacher so we can tag the session with teacher_id.
  // Without this, template-launched sessions end up with no teacher
  // reference on the row and RLS blocks the teacher from reading
  // their own sessions (the activity_id points at a template with
  // teacher_id IS NULL).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated — cannot create a session.");
  }

  // Generate unique PIN with collision check
  let pinCode = generatePin();
  let attempts = 0;

  while (attempts < 10) {
    // maybeSingle() returns null (no error) when 0 rows match, instead of the
    // 406 PostgREST throws for .single() on an empty result. Generating a
    // fresh PIN is the common case, so we want the empty result to be silent.
    const { data: existing } = await supabase
      .from("game_sessions")
      .select("id")
      .eq("pin_code", pinCode)
      .eq("status", "waiting")
      .maybeSingle();

    if (!existing) break;
    pinCode = generatePin();
    attempts++;
  }

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      activity_id: activityId,
      pin_code: pinCode,
      teacher_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates a playlist of game sessions — one per activity in the class plan.
 * Each session gets its own unique PIN (schema enforces unique pin_code).
 * Students are auto-redirected between activities via realtime broadcast.
 * Returns the first session (playlist_order = 0).
 */
export async function createPlaylistSession(
  supabase: SupabaseClient<Database>,
  activities: Array<{ activity_id: string }>,
  classPlanId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated — cannot create a session.");

  // Generate a unique PIN for each activity in the playlist
  const usedPins = new Set<string>();

  async function uniquePin(): Promise<string> {
    let pin = generatePin();
    let attempts = 0;
    while (attempts < 20) {
      if (usedPins.has(pin)) {
        pin = generatePin();
        attempts++;
        continue;
      }
      const { data: existing } = await supabase
        .from("game_sessions")
        .select("id")
        .eq("pin_code", pin)
        .eq("status", "waiting")
        .maybeSingle();
      if (!existing) {
        usedPins.add(pin);
        return pin;
      }
      pin = generatePin();
      attempts++;
    }
    throw new Error("Could not generate unique PIN after 20 attempts");
  }

  // Create sessions sequentially so each gets a unique PIN
  const sessions = [];
  for (let i = 0; i < activities.length; i++) {
    const pin = await uniquePin();
    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        activity_id: activities[i].activity_id,
        pin_code: pin,
        teacher_id: user.id,
        class_plan_id: classPlanId,
        playlist_order: i,
        status: "waiting" as const,
      })
      .select()
      .single();
    if (error) throw error;
    sessions.push(data);
  }

  if (sessions.length === 0) throw new Error("No sessions created");
  return sessions[0]; // Return first session
}

export async function joinGameSession(
  supabase: SupabaseClient<Database>,
  pinCode: string,
  studentName: string,
  avatarId: string
) {
  // Find session by PIN
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("pin_code", pinCode)
    .in("status", ["waiting", "playing"])
    .single();

  if (sessionError || !session) {
    throw new Error("Game not found. Check your PIN code.");
  }

  // Create student record
  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({ name: studentName, avatar_id: avatarId })
    .select()
    .single();

  if (studentError || !student) throw studentError;

  // Add to session participants
  const { error: joinError } = await supabase
    .from("session_participants")
    .insert({ session_id: session.id, student_id: student.id });

  if (joinError) throw joinError;

  // Initialize leaderboard entry
  await supabase
    .from("leaderboard_entries")
    .insert({ session_id: session.id, student_id: student.id, total_score: 0, rank: 0 });

  return { session, student };
}

export async function endGameSession(
  supabase: SupabaseClient<Database>,
  sessionId: string
) {
  const { error } = await supabase
    .from("game_sessions")
    .update({ status: "finished", ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) throw error;
}

export async function updateSessionStatus(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  status: "waiting" | "playing" | "finished"
) {
  const { error } = await supabase
    .from("game_sessions")
    .update({ status })
    .eq("id", sessionId);

  if (error) throw error;
}
