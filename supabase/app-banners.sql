-- Run in Supabase SQL Editor after storage.sql

create table if not exists public.app_banners (
  id text primary key,
  placement text not null check (placement in ('login', 'home')),
  title text,
  subtitle text,
  image_url text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists app_banners_placement_sort_idx
  on public.app_banners (placement, sort_order);

alter table public.app_banners enable row level security;

insert into public.app_banners
  (id, placement, title, subtitle, image_url, sort_order, is_active)
values
  (
    'login-1',
    'login',
    'Learn mobile repairing step by step',
    'Practical courses for screen, battery, charging, and board work.',
    'https://images.unsplash.com/photo-1580910051074-2ebbe8941a49?auto=format&fit=crop&w=1200&q=80',
    1,
    true
  ),
  (
    'login-2',
    'login',
    'Watch repair videos and download guides',
    'Bench workflows, diagrams, and notes in one place.',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    2,
    true
  ),
  (
    'login-3',
    'login',
    'Train with PMRT Institute',
    'Built for technicians who repair phones every day.',
    'https://images.unsplash.com/photo-1558449028-b06a8d9635b9?auto=format&fit=crop&w=1200&q=80',
    3,
    true
  ),
  (
    'home-1',
    'home',
    null,
    null,
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1400&q=80',
    1,
    true
  )
on conflict (id) do update set
  placement = excluded.placement,
  title = excluded.title,
  subtitle = excluded.subtitle,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
