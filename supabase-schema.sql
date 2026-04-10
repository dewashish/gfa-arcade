-- ==========================================================================
-- GFA ARCADE — Full Database Schema
-- ==========================================================================
-- Run this in Supabase SQL Editor to set up all tables.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. TEACHERS (extends Supabase auth.users)
-- --------------------------------------------------------------------------
create table if not exists public.teachers (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null,
  school_name text not null default 'GEMS Founders School',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.teachers enable row level security;

create policy "Teachers can view own profile"
  on public.teachers for select using (auth.uid() = id);
create policy "Teachers can update own profile"
  on public.teachers for update using (auth.uid() = id);
create policy "Teachers can insert own profile"
  on public.teachers for insert with check (auth.uid() = id);

-- --------------------------------------------------------------------------
-- 2. ACTIVITIES (game content created by teachers)
-- --------------------------------------------------------------------------
create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  title       text not null,
  game_type   text not null,
  config_json jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "Teachers can view own activities"
  on public.activities for select using (auth.uid() = teacher_id);
create policy "Teachers can insert own activities"
  on public.activities for insert with check (auth.uid() = teacher_id);
create policy "Teachers can update own activities"
  on public.activities for update using (auth.uid() = teacher_id);
create policy "Teachers can delete own activities"
  on public.activities for delete using (auth.uid() = teacher_id);

-- --------------------------------------------------------------------------
-- 3. GAME SESSIONS (live instances of an activity)
-- --------------------------------------------------------------------------
create table if not exists public.game_sessions (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  pin_code    varchar(6) not null unique,
  status      text not null default 'waiting'
                check (status in ('waiting', 'playing', 'finished')),
  max_players integer not null default 30,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);

alter table public.game_sessions enable row level security;

-- Teachers can manage sessions for their activities
create policy "Teachers can view own sessions"
  on public.game_sessions for select using (
    exists (
      select 1 from public.activities a
      where a.id = game_sessions.activity_id and a.teacher_id = auth.uid()
    )
  );
create policy "Teachers can insert sessions"
  on public.game_sessions for insert with check (
    exists (
      select 1 from public.activities a
      where a.id = game_sessions.activity_id and a.teacher_id = auth.uid()
    )
  );
create policy "Teachers can update own sessions"
  on public.game_sessions for update using (
    exists (
      select 1 from public.activities a
      where a.id = game_sessions.activity_id and a.teacher_id = auth.uid()
    )
  );

-- Students can view sessions they've joined (by PIN lookup)
create policy "Anyone can view session by PIN"
  on public.game_sessions for select using (true);

-- --------------------------------------------------------------------------
-- 4. STUDENTS (ephemeral, created on join)
-- --------------------------------------------------------------------------
create table if not exists public.students (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  avatar_id  text not null default 'cat',
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

create policy "Anyone can create a student"
  on public.students for insert with check (true);
create policy "Anyone can view students"
  on public.students for select using (true);

-- --------------------------------------------------------------------------
-- 5. SESSION PARTICIPANTS (join table)
-- --------------------------------------------------------------------------
create table if not exists public.session_participants (
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (session_id, student_id)
);

alter table public.session_participants enable row level security;

create policy "Anyone can join a session"
  on public.session_participants for insert with check (true);
create policy "Anyone can view participants"
  on public.session_participants for select using (true);

-- --------------------------------------------------------------------------
-- 6. GAME SCORES (per-answer scoring)
-- --------------------------------------------------------------------------
create table if not exists public.game_scores (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.game_sessions(id) on delete cascade,
  student_id     uuid not null references public.students(id) on delete cascade,
  score          integer not null default 0,
  question_index integer not null default 0,
  is_correct     boolean not null default false,
  time_taken_ms  integer not null default 0,
  answered_at    timestamptz not null default now()
);

alter table public.game_scores enable row level security;

create policy "Anyone can insert scores"
  on public.game_scores for insert with check (true);
create policy "Anyone can view scores"
  on public.game_scores for select using (true);

-- --------------------------------------------------------------------------
-- 7. LEADERBOARD ENTRIES (cached, Realtime-enabled)
-- --------------------------------------------------------------------------
create table if not exists public.leaderboard_entries (
  session_id  uuid not null references public.game_sessions(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  total_score integer not null default 0,
  rank        integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (session_id, student_id)
);

alter table public.leaderboard_entries enable row level security;

create policy "Anyone can view leaderboard"
  on public.leaderboard_entries for select using (true);
create policy "Anyone can insert leaderboard"
  on public.leaderboard_entries for insert with check (true);
create policy "Anyone can update leaderboard"
  on public.leaderboard_entries for update using (true);

-- --------------------------------------------------------------------------
-- 8. TRIGGER: Auto-update leaderboard on score insert
-- --------------------------------------------------------------------------
create or replace function public.update_leaderboard()
returns trigger as $$
declare
  new_total integer;
  new_rank integer;
begin
  -- Calculate new total for this student in this session
  select coalesce(sum(score), 0) into new_total
  from public.game_scores
  where session_id = NEW.session_id and student_id = NEW.student_id;

  -- Upsert leaderboard entry
  insert into public.leaderboard_entries (session_id, student_id, total_score, rank, updated_at)
  values (NEW.session_id, NEW.student_id, new_total, 0, now())
  on conflict (session_id, student_id)
  do update set total_score = new_total, updated_at = now();

  -- Recalculate ranks for this session
  with ranked as (
    select student_id, row_number() over (order by total_score desc) as new_rank
    from public.leaderboard_entries
    where session_id = NEW.session_id
  )
  update public.leaderboard_entries le
  set rank = ranked.new_rank
  from ranked
  where le.session_id = NEW.session_id
    and le.student_id = ranked.student_id;

  return NEW;
end;
$$ language plpgsql;

create or replace trigger trg_update_leaderboard
  after insert on public.game_scores
  for each row execute function public.update_leaderboard();

-- --------------------------------------------------------------------------
-- 9. Enable Realtime on leaderboard_entries
-- --------------------------------------------------------------------------
alter publication supabase_realtime add table public.leaderboard_entries;

-- --------------------------------------------------------------------------
-- 10. Helper: Get session leaderboard
-- --------------------------------------------------------------------------
create or replace function public.get_session_leaderboard(p_session_id uuid)
returns table(
  student_id uuid,
  student_name text,
  avatar_id text,
  total_score integer,
  rank bigint
) as $$
  select s.id, s.name, s.avatar_id,
         coalesce(sum(gs.score), 0)::integer as total_score,
         rank() over (order by coalesce(sum(gs.score), 0) desc)
  from public.session_participants sp
  join public.students s on s.id = sp.student_id
  left join public.game_scores gs on gs.student_id = s.id and gs.session_id = p_session_id
  where sp.session_id = p_session_id
  group by s.id, s.name, s.avatar_id
  order by total_score desc;
$$ language sql stable;
