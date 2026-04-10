import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createGameSession(
  supabase: SupabaseClient<Database>,
  activityId: string
) {
  // Generate unique PIN with collision check
  let pinCode = generatePin();
  let attempts = 0;

  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("game_sessions")
      .select("id")
      .eq("pin_code", pinCode)
      .eq("status", "waiting")
      .single();

    if (!existing) break;
    pinCode = generatePin();
    attempts++;
  }

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({ activity_id: activityId, pin_code: pinCode })
    .select()
    .single();

  if (error) throw error;
  return data;
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
