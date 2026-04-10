-- ==========================================================================
-- GFA ARCADE — Shared Activities Migration
-- ==========================================================================
-- Adds a `shared` flag so activities can be visible to all teachers.
-- Run this in Supabase SQL Editor.
-- ==========================================================================

-- 1. Add shared column
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS shared boolean NOT NULL DEFAULT false;

-- 2. Drop existing select policy and replace with one that includes shared activities
DROP POLICY IF EXISTS "Teachers can view own activities" ON public.activities;

CREATE POLICY "Teachers can view own or shared activities"
  ON public.activities FOR SELECT USING (
    auth.uid() = teacher_id OR shared = true
  );

-- 3. Mark the maths quiz as shared (available to all teachers)
UPDATE public.activities SET shared = true WHERE title = '🔢 Year 1 Maths Adventure';

-- 4. Verify
SELECT title, shared FROM public.activities;
