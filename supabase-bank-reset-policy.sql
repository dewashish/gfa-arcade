-- Cleanup + add DELETE policy for template activities.
--
-- Why this migration exists:
--   The Activity Bank seeder (`scripts/seed-bank.mjs --reset`) calls
--   `.from("activities").delete().eq("is_template", true)` to wipe
--   existing templates before re-inserting. But `supabase-bank.sql`
--   only adds SELECT + INSERT policies for templates — there is no
--   DELETE policy, so Supabase silently no-ops the delete (returns
--   success with 0 rows affected, no error). The seed script then
--   appends new rows on top of the old ones, causing duplicates.
--
--   This script:
--     1. Wipes all current template rows so the bank is clean.
--     2. Adds a DELETE RLS policy that lets any authenticated user
--        delete template rows (templates are shared system content,
--        not owned by individual teachers, so broad delete is OK).
--
-- Safe to run multiple times. The DELETE in step 1 is idempotent
-- (if there are no templates, it's a no-op). The CREATE POLICY is
-- wrapped in the same "if not exists" idiom already used in
-- supabase-bank.sql.

-- 1. Wipe existing templates (runs as postgres, bypasses RLS).
delete from public.activities where is_template = true;

-- 2. Add DELETE policy so future --reset runs from the seed script
--    (running as an authenticated teacher) can actually delete.
do $$
begin
  if not exists (
    select 1 from pg_policies
      where schemaname = 'public'
      and tablename = 'activities'
      and policyname = 'Authenticated users can delete templates'
  ) then
    create policy "Authenticated users can delete templates"
      on public.activities for delete
      using (is_template = true and teacher_id is null);
  end if;
end$$;

-- Verification — should return 0 right after running this file.
-- select count(*) from public.activities where is_template = true;
