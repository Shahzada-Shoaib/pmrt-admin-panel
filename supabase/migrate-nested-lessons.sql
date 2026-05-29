-- Run ONCE if you already have the OLD flat course_lessons table (rows with type/video_url columns).
-- Fresh installs: use courses.sql only.

create table if not exists public.lesson_items (
  id text primary key,
  lesson_id text not null references public.course_lessons (id) on delete cascade,
  sort_order int not null default 0,
  type text not null check (type in ('video', 'material')),
  title text not null,
  description text not null default '',
  duration text,
  video_url text,
  material_url text,
  material_format text check (material_format in ('image', 'pdf')),
  created_at timestamptz not null default now()
);

create index if not exists lesson_items_lesson_id_idx on public.lesson_items (lesson_id);

alter table public.lesson_items enable row level security;

-- Migrate each old flat row → one lesson container + one item (only if legacy columns exist)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_lessons'
      and column_name = 'type'
  ) then
    insert into public.lesson_items (
      id, lesson_id, sort_order, type, title, description, duration, video_url, material_url, material_format
    )
    select
      id || '-item',
      id,
      1,
      type,
      title,
      coalesce(description, ''),
      duration,
      video_url,
      material_url,
      material_format
    from public.course_lessons
  on conflict (id) do nothing;

    alter table public.course_lessons drop column if exists type;
    alter table public.course_lessons drop column if exists duration;
    alter table public.course_lessons drop column if exists video_url;
    alter table public.course_lessons drop column if exists material_url;
    alter table public.course_lessons drop column if exists material_format;

    alter table public.course_lessons
      alter column description set default '';
  end if;
end $$;

-- Recount lesson containers per course
update public.courses c
set lesson_count = (
  select count(*)::int from public.course_lessons l where l.course_id = c.id
),
updated_at = now();
