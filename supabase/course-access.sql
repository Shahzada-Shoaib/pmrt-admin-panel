-- Run in Supabase SQL Editor after profiles.sql and courses.sql

create table if not exists public.course_access (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (profile_id, course_id)
);

create index if not exists course_access_profile_id_idx on public.course_access (profile_id);

alter table public.course_access enable row level security;

-- Writes via admin API (service role). No public policies yet.
