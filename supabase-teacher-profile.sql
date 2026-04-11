-- ==========================================================================
-- GFA Arcade — Teacher profile migration (classroom + role)
-- ==========================================================================
-- Adds classroom and role fields to the teachers table so the new
-- signup flow can capture them. Also updates the handle_new_user
-- trigger to copy them out of auth.users.raw_user_meta_data.
--
-- Run this in the Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- ==========================================================================

-- 1. Add columns
alter table public.teachers
  add column if not exists classroom text,
  add column if not exists role text;

-- 2. Update the trigger to read classroom + role from auth metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.teachers (id, email, name, classroom, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'classroom', ''),
    nullif(new.raw_user_meta_data->>'role', '')
  )
  on conflict (id) do update
    set name      = excluded.name,
        classroom = excluded.classroom,
        role      = excluded.role;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Make sure the trigger is attached
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
