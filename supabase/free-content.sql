-- Run in Supabase SQL Editor after courses.sql

create table if not exists public.free_videos (
  id text primary key,
  title text not null,
  duration_label text not null default '',
  video_url text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.study_materials (
  id text primary key,
  title text not null,
  material_url text not null,
  material_format text not null check (material_format in ('image', 'pdf')),
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists free_videos_sort_idx on public.free_videos (sort_order);
create index if not exists study_materials_sort_idx on public.study_materials (sort_order);

alter table public.free_videos enable row level security;
alter table public.study_materials enable row level security;

insert into public.free_videos (id, title, duration_label, video_url, sort_order, is_published) values
('fv-1', 'Screen replacement — tools & safety', '8:24', 'https://www.w3schools.com/html/mov_bbb.mp4', 1, true),
('fv-2', 'Charging port faults — quick checks', '6:12', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 2, true),
('fv-3', 'Battery swap workflow', '10:05', 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4', 3, true),
('fv-4', 'Board-level basics (intro)', '5:48', 'https://storage.googleapis.com/exoplayer-test-media-1/mp4/android-screens-10s.mp4', 4, true)
on conflict (id) do update set
  title = excluded.title,
  duration_label = excluded.duration_label,
  video_url = excluded.video_url,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.study_materials (id, title, material_url, material_format, sort_order, is_published) values
('sm-1', 'Charging board — component map', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80', 'image', 1, true),
('sm-2', 'Bench reference sheet (PDF)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 2, true),
('sm-3', 'Power & flex routing diagram', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', 'image', 3, true),
('sm-4', 'Repair checklist — printable', 'https://pdfobject.com/pdf/sample.pdf', 'pdf', 4, true),
('sm-5', 'Board overview — labels', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'image', 5, true)
on conflict (id) do update set
  title = excluded.title,
  material_url = excluded.material_url,
  material_format = excluded.material_format,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;
