-- ==========================================================================
-- GFA Arcade — Activity Bank Migration
-- ==========================================================================
-- Adds template + curriculum metadata columns to the activities table so
-- ready-made content can live alongside teacher-created activities.
--
-- Run this in the Supabase SQL Editor.
-- ==========================================================================

-- 1. Add template + curriculum columns
alter table public.activities
  add column if not exists is_template  boolean not null default false,
  add column if not exists subject      text,
  add column if not exists topic        text,
  add column if not exists year_level   text default 'Year 1',
  add column if not exists difficulty   text default 'easy',
  add column if not exists description  text;

-- 2. Allow templates with no owning teacher (system content)
alter table public.activities alter column teacher_id drop not null;

-- 3. RLS: anyone authenticated can view templates
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'activities'
      and policyname = 'Anyone can view templates'
  ) then
    create policy "Anyone can view templates"
      on public.activities for select
      using (is_template = true);
  end if;
end $$;

-- 4. Allow service-role / authenticated inserts of templates with NULL teacher_id.
--    The existing "Teachers can insert own activities" policy requires
--    teacher_id = auth.uid(); we add a separate policy that allows
--    is_template = true with teacher_id IS NULL for the seeding script.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'activities'
      and policyname = 'Authenticated users can insert templates'
  ) then
    create policy "Authenticated users can insert templates"
      on public.activities for insert
      with check (is_template = true and teacher_id is null);
  end if;
end $$;

-- 5. Index for fast bank queries
create index if not exists activities_template_subject_idx
  on public.activities (is_template, subject)
  where is_template = true;

-- 6. Allow anonymous to read sessions for a template (so the existing
--    leaderboard route works when a teacher launches a template session)
--    The existing "Anyone can view session by PIN" already covers this.

-- ==========================================================================
-- Verification queries (run AFTER seeding)
-- ==========================================================================
-- select count(*) from public.activities where is_template = true;
-- select subject, count(*) from public.activities where is_template = true group by subject order by 1;
