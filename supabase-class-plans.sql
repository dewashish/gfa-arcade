-- Class Plans + Playlist Session support.
--
-- Adds:
--   1. class_plans table — saved lesson plans with activities + pacing config
--   2. class_plan_id + playlist_order columns on game_sessions — links
--      multiple sessions into one playlist launch
--   3. RLS policies so teachers can CRUD their own plans
--
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS guards).

-- 1. class_plans table
create table if not exists public.class_plans (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade not null,
  name text not null default 'Untitled Class',
  activities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for teacher lookups
create index if not exists class_plans_teacher_idx
  on public.class_plans (teacher_id, updated_at desc);

-- Enable RLS
alter table public.class_plans enable row level security;

-- RLS: teachers own their plans
drop policy if exists "Teachers own their plans" on public.class_plans;
create policy "Teachers own their plans"
  on public.class_plans for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- 2. Add playlist columns to game_sessions
alter table public.game_sessions
  add column if not exists class_plan_id uuid references public.class_plans(id) on delete set null;

alter table public.game_sessions
  add column if not exists playlist_order int;

create index if not exists game_sessions_playlist_idx
  on public.game_sessions (class_plan_id, playlist_order)
  where class_plan_id is not null;

-- Verification
-- select * from public.class_plans limit 5;
-- select class_plan_id, playlist_order from public.game_sessions where class_plan_id is not null limit 5;
