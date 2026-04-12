-- Allow teachers to DELETE their own game_sessions.
-- Without this, createPlaylistSession's cleanup of old sessions from
-- a relaunched class plan silently fails (RLS blocks the DELETE).

drop policy if exists "Teachers can delete own sessions" on public.game_sessions;
create policy "Teachers can delete own sessions"
  on public.game_sessions for delete
  using (teacher_id = auth.uid());
