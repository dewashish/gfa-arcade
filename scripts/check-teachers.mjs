import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8").split("\n")
    .filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i+1).trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
await supabase.auth.signInWithPassword({ email: "sarah.teacher@gemsfounders.ae", password: "TestPass123!" });
const { data, error } = await supabase.from("teachers").select("id, email, name, classroom, role");
if (error) {
  console.log("ERROR:", error.message);
  console.log("CODE:", error.code);
} else {
  console.log("✓ classroom + role columns exist");
  console.log("Rows:", JSON.stringify(data, null, 2));
}
process.exit(0);
