#!/usr/bin/env node
/**
 * Leaderboard simulator for GFA Arcade.
 *
 * Usage:
 *   node scripts/simulate-leaderboard.mjs <PIN>            # 8 students, default speed
 *   node scripts/simulate-leaderboard.mjs <PIN> 6          # 6 students
 *   node scripts/simulate-leaderboard.mjs <PIN> 6 600      # 6 students, 600ms tick
 *
 * Joins N fake students into the live session for the given PIN, then
 * loops inserting random game_scores so the leaderboard rank order moves
 * around in real time. Press Ctrl+C to stop.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "..", ".env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const TEACHER_EMAIL = "sarah.teacher@gemsfounders.ae";
const TEACHER_PASSWORD = "TestPass123!";

async function ensureSignedIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email: TEACHER_EMAIL,
    password: TEACHER_PASSWORD,
  });
  if (error) {
    console.error("❌ Failed to sign in as teacher:", error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (const a of args) {
  if (a.startsWith("--")) {
    const [k, v] = a.slice(2).split("=");
    flags[k] = v ?? true;
  } else {
    positional.push(a);
  }
}

const COUNT = Number(flags.count ?? positional[1] ?? 8);
const TICK_MS = Number(flags.tick ?? positional[2] ?? 900);
const PIN_INPUT = flags.pin ?? positional[0] ?? null;
const ACTIVITY_ID = flags.activity ?? null;

const FAKE_STUDENTS = [
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

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function findOrCreateSession() {
  if (PIN_INPUT) {
    console.log(`🎮 Looking up session with PIN ${PIN_INPUT}...`);
    const { data, error } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("pin_code", PIN_INPUT)
      .in("status", ["waiting", "playing"])
      .maybeSingle();
    if (error || !data) {
      console.error(`❌ No active session found for PIN ${PIN_INPUT}.`);
      process.exit(1);
    }
    return data;
  }

  // Create a fresh session for an activity
  let activityId = ACTIVITY_ID;
  if (!activityId) {
    const { data: acts } = await supabase
      .from("activities")
      .select("id, title")
      .eq("game_type", "quiz")
      .order("updated_at", { ascending: false })
      .limit(1);
    if (!acts || acts.length === 0) {
      console.error("❌ No quiz activities found. Pass --activity=<id> or create one first.");
      process.exit(1);
    }
    activityId = acts[0].id;
    console.log(`📚 Using activity: ${acts[0].title} (${activityId})`);
  }

  const pin = generatePin();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({ activity_id: activityId, pin_code: pin, status: "playing" })
    .select()
    .single();
  if (error || !data) {
    console.error("❌ Failed to create session:", error?.message);
    process.exit(1);
  }
  console.log(`\n🆕 Created session ${data.id}`);
  console.log(`🔢 PIN: ${data.pin_code}`);
  console.log(`👀 Watch it live: http://localhost:3000/leaderboard/${data.id}\n`);
  return data;
}

async function main() {
  await ensureSignedIn();
  const session = await findOrCreateSession();
  console.log(`✓ Session ${session.id} (status: ${session.status})`);

  const roster = FAKE_STUDENTS.slice(0, COUNT);
  const joined = [];

  console.log(`👥 Joining ${roster.length} fake students...`);
  for (const fake of roster) {
    const { data: student, error: stErr } = await supabase
      .from("students")
      .insert({ name: fake.name, avatar_id: fake.avatar_id })
      .select()
      .single();
    if (stErr || !student) {
      console.error(`  ✗ Failed to create ${fake.name}:`, stErr?.message);
      continue;
    }

    await supabase
      .from("session_participants")
      .insert({ session_id: session.id, student_id: student.id });

    await supabase
      .from("leaderboard_entries")
      .insert({
        session_id: session.id,
        student_id: student.id,
        total_score: 0,
        rank: 0,
      });

    joined.push(student);
    console.log(`  ✓ ${fake.name} joined`);
  }

  if (joined.length === 0) {
    console.error("❌ No students joined. Aborting.");
    process.exit(1);
  }

  console.log(`\n🏁 Simulating live scoring (every ${TICK_MS}ms). Press Ctrl+C to stop.\n`);

  let qIndex = 0;
  let cleanupRequested = false;

  process.on("SIGINT", async () => {
    if (cleanupRequested) process.exit(0);
    cleanupRequested = true;
    console.log("\n🧹 Cleaning up fake students...");
    for (const s of joined) {
      await supabase.from("leaderboard_entries").delete().eq("session_id", session.id).eq("student_id", s.id);
      await supabase.from("game_scores").delete().eq("session_id", session.id).eq("student_id", s.id);
      await supabase.from("session_participants").delete().eq("session_id", session.id).eq("student_id", s.id);
      await supabase.from("students").delete().eq("id", s.id);
    }
    console.log("✓ Done. Bye!");
    process.exit(0);
  });

  // Score loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Pick 1-3 random students this tick to make it lively
    const burstSize = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < burstSize; i++) {
      const student = joined[Math.floor(Math.random() * joined.length)];
      const isCorrect = Math.random() > 0.18;
      const baseScore = isCorrect ? 800 + Math.floor(Math.random() * 600) : 0;
      const streakBonus = isCorrect && Math.random() > 0.6 ? Math.floor(baseScore * 0.3) : 0;
      const score = baseScore + streakBonus;

      const { error } = await supabase.from("game_scores").insert({
        session_id: session.id,
        student_id: student.id,
        score,
        question_index: qIndex,
        is_correct: isCorrect,
        time_taken_ms: 1500 + Math.floor(Math.random() * 6000),
      });
      if (error) {
        console.log(`  ⚠️  ${student.name}: ${error.message}`);
      } else {
        const icon = isCorrect ? "✅" : "❌";
        console.log(`  ${icon} ${student.name.padEnd(12)} +${score.toString().padStart(5)} pts`);
      }
    }
    qIndex++;
    await new Promise((r) => setTimeout(r, TICK_MS));
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
