-- Fix the over-eager backfill from supabase-reports-rls-fix.sql.
--
-- Problem:
--   The original backfill assumed every NULL teacher_id row on
--   game_sessions belonged to the Sarah test account:
--
--     update public.game_sessions
--     set teacher_id = (select id from public.teachers
--                        where email = 'sarah.teacher@gemsfounders.ae')
--     where teacher_id is null;
--
--   If multiple real teachers (e.g. Ms Akansha) had already played
--   sessions before the migration ran, ALL of their sessions got
--   silently reassigned to Sarah, so their Dashboard / Reports now
--   show zero.
--
--   We cannot definitively recover the original owner because no
--   record of "who launched this session" was kept. The best
--   deterministic signal we have is the user flow:
--
--     game_sessions.activity_id -> activities.teacher_id
--
--   …but for template launches (bank activities) activity_id points
--   at a template with teacher_id IS NULL, so we can't recover that
--   way either.
--
-- Recovery options (in order of preference):
--
--   1) For teacher-owned activities: re-assign the session to whichever
--      teacher owns the activity. This is 100% correct because only the
--      owning teacher can launch a session from their own library.
--   2) For template-launched sessions: leave as-is (the bad backfill
--      assigned them to Sarah) and instead rely on NEW sessions going
--      forward carrying the correct teacher_id via createGameSession.
--      Teachers will see their real dashboards populate as soon as
--      they launch their next session.
--   3) If the user can identify specific historical sessions by pin or
--      date, a one-off UPDATE can reassign them manually (see bottom).
--
-- Safe to run multiple times. Only touches rows whose current
-- teacher_id points at Sarah AND whose underlying activity is
-- actually teacher-owned by someone else.

-- 1. Reclaim sessions whose activity is owned by a real (non-Sarah)
--    teacher. These were clearly misassigned by the backfill.
update public.game_sessions gs
set teacher_id = a.teacher_id
from public.activities a
where gs.activity_id = a.id
  and a.teacher_id is not null
  and gs.teacher_id = (
    select id from public.teachers where email = 'sarah.teacher@gemsfounders.ae'
  )
  and a.teacher_id <> (
    select id from public.teachers where email = 'sarah.teacher@gemsfounders.ae'
  );

-- 2. Optional manual reclaim — uncomment and fill in if you know
--    the specific pin codes Ms Akansha ran and want to transfer
--    those template-launched sessions to her account:
--
--   update public.game_sessions
--   set teacher_id = (
--     select id from public.teachers where email = '<her-email>'
--   )
--   where pin_code in ('123456', '789012', ...);

-- Verification — run these after the update above:
--
--   select t.email, count(*) as sessions
--   from public.game_sessions gs
--   left join public.teachers t on t.id = gs.teacher_id
--   group by t.email
--   order by 2 desc;
