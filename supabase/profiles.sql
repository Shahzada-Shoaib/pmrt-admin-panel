-- Run once in Supabase → SQL Editor

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_firebase_uid_idx on public.profiles (firebase_uid);

alter table public.profiles enable row level security;

-- Writes go through the admin API (service role). No public policies yet.
