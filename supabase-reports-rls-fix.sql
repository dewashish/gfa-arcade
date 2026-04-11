-- Dashboard + Reports RLS fix.
--
-- Problem:
--   When the teacher launches a bank activity via "Use in class", the
--   resulting game_session row has activity_id pointing to a TEMPLATE
--   activity (teacher_id IS NULL, is_template = true). The existing
--   SELECT policy on game_sessions requires the joined activity's
--   teacher_id to match auth.uid():
--
--     exists (select 1 from activities a
--             where a.id = game_sessions.activity_id
--             and a.teacher_id = auth.uid())
--
--   Templates have teacher_id IS NULL so the policy always evaluates
--   to FALSE, and the teacher cannot read her own template-launched
--   sessions via PostgREST. Raw SQL in the editor works because it
--   runs as postgres and bypasses RLS. The Dashboard + Reports pages
--   go through the anon client and hit zero rows.
--
-- Fix:
--   1. Add a teacher_id column to game_sessions that tracks who
--      actually launched the session.
--   2. Replace the SELECT / UPDATE RLS policies to use
--      teacher_id = auth.uid() directly — cleaner, faster, works
--      for both template and teacher-owned activity launches.
--   3. Keep the anon SELECT policy (students joining via PIN) as-is.
--   4. Backfill existing rows for the test teacher so her prior
--      sessions show up in the Dashboard after this migration runs.
--
-- Safe to run multiple times. The column add + policy replace are
-- idempotent.

-- 1. Add teacher_id column (nullable initially so existing rows are valid)
alter table public.game_sessions
  add column if not exists teacher_id uuid references public.teachers(id) on delete set null;

create index if not exists game_sessions_teacher_idx
  on public.game_sessions (teacher_id, started_at desc);

-- 2. Backfill: every existing session that has no teacher_id gets
--    assigned to Ms. Sarah (the only test teacher account). Production
--    will run this fresh and never hit the NULL case — the
--    createGameSession code will always set teacher_id on insert.
update public.game_sessions
set teacher_id = (
  select id from public.teachers where email = 'sarah.teacher@gemsfounders.ae'
)
where teacher_id is null;

-- 3. Replace the SELECT / UPDATE policies with teacher_id-based ones.
--    Must drop first because Postgres doesn't let you ALTER a policy's
--    USING expression in place.
drop policy if exists "Teachers can view own sessions" on public.game_sessions;
create policy "Teachers can view own sessions"
  on public.game_sessions for select
  using (teacher_id = auth.uid());

drop policy if exists "Teachers can update own sessions" on public.game_sessions;
create policy "Teachers can update own sessions"
  on public.game_sessions for update
  using (teacher_id = auth.uid());

-- Keep INSERT policy so teachers can still create sessions; the check
-- now just requires teacher_id to be their own id.
drop policy if exists "Teachers can insert sessions" on public.game_sessions;
create policy "Teachers can insert sessions"
  on public.game_sessions for insert
  with check (teacher_id = auth.uid());

-- 4. Leaderboard entries SELECT — mirror the same pattern so teachers
--    can read entries for their own sessions through PostgREST.
drop policy if exists "Teachers can view leaderboard" on public.leaderboard_entries;
create policy "Teachers can view leaderboard"
  on public.leaderboard_entries for select
  using (
    exists (
      select 1 from public.game_sessions gs
      where gs.id = leaderboard_entries.session_id
        and gs.teacher_id = auth.uid()
    )
  );

-- 5. Session participants SELECT — same treatment.
drop policy if exists "Teachers can view participants" on public.session_participants;
create policy "Teachers can view participants"
  on public.session_participants for select
  using (
    exists (
      select 1 from public.game_sessions gs
      where gs.id = session_participants.session_id
        and gs.teacher_id = auth.uid()
    )
  );

-- Verification queries — should all return > 0 after this migration.
-- select count(*) from public.game_sessions where teacher_id is not null;
-- select count(*) from public.session_participants;
-- select count(*) from public.leaderboard_entries;
