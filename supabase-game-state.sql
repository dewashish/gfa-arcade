-- Adds a server-persisted current_question_index to game_sessions so that
-- students who join mid-game render the same question the teacher is on.
-- Without this, realtime broadcasts were the only source of truth and any
-- student who joined after the teacher clicked "Next Question" would be
-- stuck rendering question 0 until the next broadcast.
--
-- Safe to run multiple times.

alter table public.game_sessions
  add column if not exists current_question_index int not null default 0;

-- Index is not needed (always selected via primary key lookup) but make
-- the value visible through the existing RLS policies — no extra policies
-- required because the column lives on an already-readable row.
