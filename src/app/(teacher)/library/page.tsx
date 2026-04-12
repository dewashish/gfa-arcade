import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryClient } from "./library-client";
import type { Database } from "@/lib/supabase/types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type ClassPlan = Database["public"]["Tables"]["class_plans"]["Row"];

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [activitiesRes, plansRes] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("teacher_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("class_plans")
      .select("*")
      .eq("teacher_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <LibraryClient
      activities={(activitiesRes.data ?? []) as Activity[]}
      classPlans={(plansRes.data ?? []) as ClassPlan[]}
    />
  );
}
