-- Run in Supabase SQL Editor after courses.sql
-- Allows marking individual videos/materials as free previews when a course is locked.

alter table public.lesson_items
  add column if not exists is_preview boolean not null default false;

create index if not exists lesson_items_is_preview_idx
  on public.lesson_items (is_preview)
  where is_preview = true;

-- Whole-lesson preview: all items in the lesson stay available when the course is locked.
alter table public.course_lessons
  add column if not exists is_preview boolean not null default false;

create index if not exists course_lessons_is_preview_idx
  on public.course_lessons (is_preview)
  where is_preview = true;
