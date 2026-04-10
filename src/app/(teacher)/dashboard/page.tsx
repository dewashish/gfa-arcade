import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { BankActivity } from "@/lib/bank/types";
import type { Database } from "@/lib/supabase/types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Teacher profile
  const { data: teacher } = await supabase
    .from("teachers")
    .select("name")
    .eq("id", user.id)
    .single();

  const firstName =
    teacher?.name
      ?.replace(/^(Ms\.?|Mr\.?|Mrs\.?|Dr\.?)\s+/i, "")
      ?.split(" ")[0] ?? "Teacher";

  // Teacher's recent activities (max 3 — this is the "continue where you left off" strip)
  const { data: recentActivities } = await supabase
    .from("activities")
    .select("*")
    .eq("teacher_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  // Recent sessions for the activity strip
  const { data: rawSessions } = await supabase
    .from("game_sessions")
    .select("id, started_at, activities!inner(teacher_id, title, game_type)")
    .eq("activities.teacher_id", user.id)
    .order("started_at", { ascending: false })
    .limit(3);

  const recentSessionsRaw = (rawSessions ?? []) as unknown as Array<{
    id: string;
    started_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any;
  }>;

  // Hydrate sessions with participant counts and top scorers (single round-trip per session)
  const recentSessions = await Promise.all(
    recentSessionsRaw.map(async (s) => {
      const [{ count: pCount }, { data: top }] = await Promise.all([
        supabase
          .from("session_participants")
          .select("*", { count: "exact", head: true })
          .eq("session_id", s.id),
        supabase
          .from("game_scores")
          .select("score, students(name, avatar_id)")
          .eq("session_id", s.id)
          .order("score", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stu = (top as any)?.students;
      return {
        id: s.id,
        title: s.activities?.title ?? "Untitled",
        startedAt: s.started_at,
        participants: pCount ?? 0,
        topScorer: stu
          ? { name: stu.name, avatarId: stu.avatar_id, score: top?.score ?? 0 }
          : null,
      };
    })
  );

  // KPI numbers
  const totalSessions = recentSessionsRaw.length;
  let totalStudents = 0;
  if (recentSessionsRaw.length > 0) {
    const sessionIds = recentSessionsRaw.map((s) => s.id);
    const { count } = await supabase
      .from("session_participants")
      .select("*", { count: "exact", head: true })
      .in("session_id", sessionIds);
    totalStudents = count ?? 0;
  }

  // Today's Pick — random featured template from the bank
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: templates } = await supabase
    .from("activities")
    .select(
      "id, title, game_type, description, subject, topic, year_level, difficulty, config_json, created_at"
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("is_template" as any, true);

  const templateList = (templates ?? []) as unknown as BankActivity[];
  const todaysPick =
    templateList.length > 0
      ? templateList[Math.floor(Math.random() * templateList.length)]
      : null;

  return (
    <DashboardClient
      teacherFirstName={firstName}
      recentActivities={(recentActivities ?? []) as Activity[]}
      recentSessions={recentSessions}
      totalSessions={totalSessions}
      totalStudents={totalStudents}
      todaysPick={todaysPick}
    />
  );
}
