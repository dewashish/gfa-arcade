import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryClient } from "./library-client";
import type { Database } from "@/lib/supabase/types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("teacher_id", user.id)
    .order("updated_at", { ascending: false });

  return <LibraryClient activities={(data ?? []) as Activity[]} />;
}
