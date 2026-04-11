import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BankClient } from "./bank-client";
import type { BankActivity } from "@/lib/bank/types";

export default async function BankPage() {
  const supabase = await createClient();

  // Auth check FIRST — every other teacher page does this. Without it,
  // unauthenticated requests run the activities query and hang waiting
  // for it to complete (or for RLS to deny it), then the (teacher)
  // layout redirects after 30+ seconds. Match the pattern used by
  // /library, /reports, /settings.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all template activities. RLS policy "Anyone can view templates"
  // makes this safe for any authenticated user.
  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, title, game_type, description, subject, topic, year_level, difficulty, config_json, created_at"
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("is_template" as any, true)
    .order("subject", { ascending: true })
    .order("title", { ascending: true });

  const templates = (data ?? []) as unknown as BankActivity[];

  return <BankClient templates={templates} fetchError={error?.message ?? null} />;
}
