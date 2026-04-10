-- Fix: Create teacher profile automatically on signup
-- Run this in Supabase SQL Editor

-- 1. Create a function that auto-creates a teacher profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.teachers (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Also add a security definer function for manual teacher creation
-- (fallback if trigger doesn't fire)
create or replace function public.create_teacher_profile(
  p_user_id uuid,
  p_email text,
  p_name text
) returns void as $$
begin
  insert into public.teachers (id, email, name)
  values (p_user_id, p_email, p_name)
  on conflict (id) do nothing;
end;
$$ language plpgsql security definer;
