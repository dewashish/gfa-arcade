import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Teacher profile (first name only for hero)
  const { data: teacher } = await supabase
    .from("teachers")
    .select("name")
    .eq("id", user!.id)
    .single();

  const firstName =
    teacher?.name
      ?.replace(/^(Ms\.?|Mr\.?|Mrs\.?|Dr\.?)\s+/i, "")
      ?.split(" ")[0] ?? "Teacher";

  // Teacher's own activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("teacher_id", user!.id)
    .order("updated_at", { ascending: false })
    .limit(8);

  // Shared activities from other teachers
  const { data: sharedActivities } = await supabase
    .from("activities")
    .select("*")
    .eq("shared", true)
    .neq("teacher_id", user!.id)
    .order("updated_at", { ascending: false })
    .limit(6);

  // Recent sessions for engagement stats
  const { data: recentSessions } = await supabase
    .from("game_sessions")
    .select("id, started_at, activity_id, activities!inner(teacher_id, title)")
    .eq("activities.teacher_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(20);

  // Total students engaged
  let totalStudents = 0;
  let topScorer: { name: string; score: number; activity: string } | null = null;

  if (recentSessions && recentSessions.length > 0) {
    const sessionIds = recentSessions.map((s) => s.id);
    const { count } = await supabase
      .from("session_participants")
      .select("*", { count: "exact", head: true })
      .in("session_id", sessionIds);
    totalStudents = count ?? 0;

    // Top scorer across recent sessions (single highest game_score)
    const { data: highest } = await supabase
      .from("game_scores")
      .select("score, session_id, students(name), game_sessions(activities(title))")
      .in("session_id", sessionIds)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (highest) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentName = (highest as any).students?.name ?? "Student";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activityTitle =
        (highest as any).game_sessions?.activities?.title ?? "a game";
      topScorer = {
        name: studentName,
        score: highest.score ?? 0,
        activity: activityTitle,
      };
    }
  }

  // Engagement % — proportion of last 5 sessions vs target of 5
  const engagementPct = Math.min(100, Math.round(((recentSessions?.length ?? 0) / 5) * 100));

  return (
    <DashboardClient
      teacherFirstName={firstName}
      activities={activities ?? []}
      sharedActivities={sharedActivities ?? []}
      totalSessions={recentSessions?.length ?? 0}
      totalStudents={totalStudents}
      engagementPct={engagementPct}
      topScorer={topScorer}
    />
  );
}
