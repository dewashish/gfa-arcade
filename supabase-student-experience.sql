-- Adds the student's actual chosen option index to game_scores so the
-- teacher's per-student detail modal (feature 3 of the classroom experience
-- upgrade) can show "picked option B, correct was option C" instead of just
-- a ✓/✗ boolean.
--
-- Nullable because:
--   (a) existing rows have no selection captured and we don't backfill, and
--   (b) not every game type maps cleanly onto a single integer (e.g. group
--       sort stores a bucket index, match-up stores a pair index) so future
--       game types may leave it null and render a game-type-specific
--       fallback in the UI instead.
--
-- Existing RLS policies (Anyone can insert / Anyone can view) on
-- public.game_scores already cover this column; no new policies required.
--
-- Safe to run multiple times.

alter table public.game_scores
  add column if not exists selected_index int;
