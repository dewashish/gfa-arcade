import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export interface ReportSession {
  id: string;
  title: string;
  startedAt: string;
  // Formatted server-side to avoid React #418 hydration mismatches when
  // the server and client sit in different timezones.
  dateLabel: string;
  participants: number;
  topScorer: { name: string; avatarId: string; score: number } | null;
}

// Format dates server-side in UTC so the string is deterministic regardless
// of where hydration runs. Format: "11 Apr 2026".
function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export interface ReportActivityStat {
  title: string;
  game_type: string;
  sessions: number;
  students: number;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sessions for this teacher's activities
  const { data: rawSessions } = await supabase
    .from("game_sessions")
    .select("id, started_at, activities!inner(teacher_id, title, game_type)")
    .eq("activities.teacher_id", user.id)
    .order("started_at", { ascending: false })
    .limit(20);

  const sessionList = (rawSessions ?? []) as unknown as Array<{
    id: string;
    started_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any;
  }>;

  // For each session, fetch participant count + top scorer
  const sessions: ReportSession[] = [];
  let totalSessions = sessionList.length;
  let totalStudents = 0;
  const activityStats = new Map<string, ReportActivityStat>();

  if (sessionList.length > 0) {
    const sessionIds = sessionList.map((s) => s.id);

    // Total students engaged across all sessions
    const { count: studentCount } = await supabase
      .from("session_participants")
      .select("*", { count: "exact", head: true })
      .in("session_id", sessionIds);
    totalStudents = studentCount ?? 0;

    // Top scorers per session
    for (const s of sessionList) {
      const { data: top } = await supabase
        .from("game_scores")
        .select("score, students(name, avatar_id)")
        .eq("session_id", s.id)
        .order("score", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count: pCount } = await supabase
        .from("session_participants")
        .select("*", { count: "exact", head: true })
        .eq("session_id", s.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stu = (top as any)?.students;
      sessions.push({
        id: s.id,
        title: s.activities?.title ?? "Untitled",
        startedAt: s.started_at,
        dateLabel: formatSessionDate(s.started_at),
        participants: pCount ?? 0,
        topScorer: stu
          ? {
              name: stu.name,
              avatarId: stu.avatar_id,
              score: top?.score ?? 0,
            }
          : null,
      });

      // Per-activity rollup
      const key = s.activities?.title ?? "Untitled";
      const existing = activityStats.get(key) ?? {
        title: key,
        game_type: s.activities?.game_type ?? "quiz",
        sessions: 0,
        students: 0,
      };
      existing.sessions += 1;
      existing.students += pCount ?? 0;
      activityStats.set(key, existing);
    }
  }

  return (
    <ReportsClient
      sessions={sessions}
      totalSessions={totalSessions}
      totalStudents={totalStudents}
      activityStats={Array.from(activityStats.values()).sort((a, b) => b.sessions - a.sessions)}
    />
  );
}
