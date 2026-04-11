import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

// ============================================================
// Shared shapes handed to the client component
// ============================================================

export interface ReportSession {
  id: string;
  title: string;
  subject: string | null;
  game_type: string;
  startedAt: string;
  /** Formatted server-side (UTC) so hydration can't disagree. */
  dateLabel: string;
  participants: number;
  topScorer: { name: string; avatarId: string; score: number } | null;
}

export interface ReportActivityStat {
  activity_id: string;
  title: string;
  subject: string | null;
  game_type: string;
  runs: number;
  avg_score: number;
  accuracy_pct: number;
  total_answers: number;
}

export interface TrendPoint {
  day: string; // ISO date "YYYY-MM-DD"
  label: string; // "11 Apr"
  sessions: number;
}

export interface ClassLeaderboardRow {
  student_id: string;
  name: string;
  avatar_id: string;
  total_score: number;
  sessions_played: number;
  correct_answers: number;
  total_answers: number;
}

// ============================================================
// Date helpers (UTC everywhere so server/client hydration agrees)
// ============================================================

function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function toDayKey(iso: string): string {
  // "YYYY-MM-DD" in UTC
  return new Date(iso).toISOString().slice(0, 10);
}

function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// ============================================================
// Page
// ============================================================

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // --------------------------------------------------------
  // 1. Sessions — filtered by game_sessions.teacher_id, which
  //    works for template-launched sessions (the old
  //    activities!inner filter only caught teacher-owned
  //    activity launches and hid everything from the bank).
  // --------------------------------------------------------
  const { data: rawSessions } = await supabase
    .from("game_sessions")
    .select(
      "id, started_at, status, activity_id, activities(title, subject, game_type)"
    )
    .eq("teacher_id", user.id)
    .order("started_at", { ascending: false })
    .limit(50);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionList = (rawSessions ?? []) as Array<any>;

  // Short-circuit empty state
  if (sessionList.length === 0) {
    return (
      <ReportsClient
        sessions={[]}
        totalSessions={0}
        totalStudents={0}
        activityStats={[]}
        trend={[]}
        classLeaderboard={[]}
      />
    );
  }

  const sessionIds = sessionList.map((s) => s.id);

  // --------------------------------------------------------
  // 2. Fetch all participants + all scores for those sessions
  //    in two parallel round-trips, then aggregate in JS.
  // --------------------------------------------------------
  const [{ data: participants }, { data: scores }] = await Promise.all([
    supabase
      .from("session_participants")
      .select("session_id, student_id, students(name, avatar_id)")
      .in("session_id", sessionIds),
    supabase
      .from("game_scores")
      .select("session_id, student_id, score, is_correct, answered_at")
      .in("session_id", sessionIds),
  ]);

  const participantRows = (participants ?? []) as Array<{
    session_id: string;
    student_id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students: any;
  }>;

  const scoreRows = (scores ?? []) as Array<{
    session_id: string;
    student_id: string;
    score: number;
    is_correct: boolean;
    answered_at: string;
  }>;

  // --------------------------------------------------------
  // 3. Per-session rollups — participant count + top scorer
  // --------------------------------------------------------
  const participantsBySession = new Map<string, number>();
  for (const p of participantRows) {
    participantsBySession.set(
      p.session_id,
      (participantsBySession.get(p.session_id) ?? 0) + 1
    );
  }

  // Top scorer per session: highest single-answer score
  // (matches the existing Dashboard semantics).
  const topScoreBySession = new Map<
    string,
    { student_id: string; score: number }
  >();
  for (const s of scoreRows) {
    const existing = topScoreBySession.get(s.session_id);
    if (!existing || s.score > existing.score) {
      topScoreBySession.set(s.session_id, {
        student_id: s.student_id,
        score: s.score,
      });
    }
  }

  // Student lookup (for the top scorer's name + avatar)
  const studentById = new Map<string, { name: string; avatar_id: string }>();
  for (const p of participantRows) {
    if (p.students) {
      studentById.set(p.student_id, {
        name: p.students.name ?? "Student",
        avatar_id: p.students.avatar_id ?? "cat",
      });
    }
  }

  const sessions: ReportSession[] = sessionList.map((s) => {
    const top = topScoreBySession.get(s.id);
    const topStudent = top ? studentById.get(top.student_id) : null;
    return {
      id: s.id,
      title: s.activities?.title ?? "Untitled",
      subject: s.activities?.subject ?? null,
      game_type: s.activities?.game_type ?? "quiz",
      startedAt: s.started_at,
      dateLabel: formatSessionDate(s.started_at),
      participants: participantsBySession.get(s.id) ?? 0,
      topScorer:
        topStudent && top
          ? {
              name: topStudent.name,
              avatarId: topStudent.avatar_id,
              score: top.score,
            }
          : null,
    };
  });

  const totalSessions = sessions.length;
  const totalStudents = participantRows.length;

  // --------------------------------------------------------
  // 4. Per-activity performance — runs, avg score, accuracy
  // --------------------------------------------------------
  const scoresBySession = new Map<string, typeof scoreRows>();
  for (const s of scoreRows) {
    const arr = scoresBySession.get(s.session_id) ?? [];
    arr.push(s);
    scoresBySession.set(s.session_id, arr);
  }

  const activityStatsMap = new Map<string, ReportActivityStat>();
  for (const s of sessionList) {
    const activityId = s.activity_id;
    const existing = activityStatsMap.get(activityId) ?? {
      activity_id: activityId,
      title: s.activities?.title ?? "Untitled",
      subject: s.activities?.subject ?? null,
      game_type: s.activities?.game_type ?? "quiz",
      runs: 0,
      avg_score: 0,
      accuracy_pct: 0,
      total_answers: 0,
    };
    existing.runs += 1;
    const sessionScores = scoresBySession.get(s.id) ?? [];
    for (const row of sessionScores) {
      existing.total_answers += 1;
      existing.avg_score += row.score;
      if (row.is_correct) existing.accuracy_pct += 1;
    }
    activityStatsMap.set(activityId, existing);
  }

  const activityStats: ReportActivityStat[] = Array.from(
    activityStatsMap.values()
  )
    .map((a) => ({
      ...a,
      avg_score:
        a.total_answers > 0 ? Math.round(a.avg_score / a.total_answers) : 0,
      accuracy_pct:
        a.total_answers > 0
          ? Math.round((a.accuracy_pct / a.total_answers) * 100)
          : 0,
    }))
    .sort((a, b) => b.runs - a.runs);

  // --------------------------------------------------------
  // 5. Engagement trend — sessions per day, last 14 days
  // --------------------------------------------------------
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 13);
  fourteenDaysAgo.setUTCHours(0, 0, 0, 0);

  const trendByDay = new Map<string, number>();
  // Pre-fill every day in the last 14 with zero so the chart has a
  // continuous axis instead of gaps.
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    trendByDay.set(toDayKey(d.toISOString()), 0);
  }
  for (const s of sessionList) {
    const day = toDayKey(s.started_at);
    if (trendByDay.has(day)) {
      trendByDay.set(day, (trendByDay.get(day) ?? 0) + 1);
    }
  }
  const trend: TrendPoint[] = Array.from(trendByDay.entries()).map(
    ([day, sessions]) => ({
      day,
      label: formatDayLabel(`${day}T00:00:00Z`),
      sessions,
    })
  );

  // --------------------------------------------------------
  // 6. Class-wide leaderboard — cumulative top 10 students
  //    across every session this teacher has run.
  // --------------------------------------------------------
  const byStudent = new Map<
    string,
    {
      student_id: string;
      name: string;
      avatar_id: string;
      total_score: number;
      sessions_played: Set<string>;
      correct: number;
      total: number;
    }
  >();
  for (const row of scoreRows) {
    const existing = byStudent.get(row.student_id) ?? {
      student_id: row.student_id,
      name: studentById.get(row.student_id)?.name ?? "Student",
      avatar_id: studentById.get(row.student_id)?.avatar_id ?? "cat",
      total_score: 0,
      sessions_played: new Set<string>(),
      correct: 0,
      total: 0,
    };
    existing.total_score += row.score;
    existing.sessions_played.add(row.session_id);
    existing.total += 1;
    if (row.is_correct) existing.correct += 1;
    byStudent.set(row.student_id, existing);
  }

  const classLeaderboard: ClassLeaderboardRow[] = Array.from(byStudent.values())
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 10)
    .map((s) => ({
      student_id: s.student_id,
      name: s.name,
      avatar_id: s.avatar_id,
      total_score: s.total_score,
      sessions_played: s.sessions_played.size,
      correct_answers: s.correct,
      total_answers: s.total,
    }));

  return (
    <ReportsClient
      sessions={sessions}
      totalSessions={totalSessions}
      totalStudents={totalStudents}
      activityStats={activityStats}
      trend={trend}
      classLeaderboard={classLeaderboard}
    />
  );
}
