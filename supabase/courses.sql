-- Run in Supabase SQL Editor after profiles.sql

create table if not exists public.courses (
  id text primary key,
  title text not null,
  instructor text not null default 'PMRT Faculty',
  description text not null,
  thumbnail text not null,
  duration_label text not null,
  lesson_count int not null default 0,
  level text not null,
  objectives jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lesson = container (title, description). Videos/materials live in lesson_items.
create table if not exists public.course_lessons (
  id text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

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

create index if not exists course_lessons_course_id_idx on public.course_lessons (course_id);
create index if not exists lesson_items_lesson_id_idx on public.lesson_items (lesson_id);

alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.lesson_items enable row level security;

-- Seed courses (3 lessons each, multiple items per lesson)

insert into public.courses (
  id, title, instructor, description, thumbnail, duration_label, lesson_count, level, objectives, sort_order
) values
(
  'professional-android-repair',
  'Professional Android Repair Program',
  'PMRT Faculty',
  'This course covers the full Android repair workflow from intake to delivery. You will work through disassembly, common display and charging faults, and final quality checks on popular handset brands.',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  '8h 30m', 3, 'Beginner',
  '["Open Android devices safely without damaging clips or flex cables","Diagnose display, battery, and charging faults on the bench","Finish each repair with testing, handover, and warranty notes"]'::jsonb,
  1
),
(
  'professional-ios-repair',
  'Professional iOS Repair Program',
  'PMRT Faculty',
  'This course teaches iPhone servicing with the correct opening tools and safe handling methods. It covers display and battery work, then the quality checks required after repair.',
  'https://images.unsplash.com/photo-1580910051074-2ebbe8941a49?auto=format&fit=crop&w=1200&q=80',
  '7h 45m', 3, 'Intermediate',
  '["Use iPhone opening tools without damaging housings or screws","Replace displays and batteries with correct cable seating and adhesive work","Verify Face ID, True Tone, and charging after assembly"]'::jsonb,
  2
),
(
  'complete-mobile-software-training',
  'Complete Mobile Software Training',
  'PMRT Faculty',
  'This course covers flashing, firmware matching, account recovery, and common service software workflows. It is designed for technicians who handle mobile software and diagnostics work on the bench.',
  'https://images.unsplash.com/photo-1558449028-b06a8d9635b9?auto=format&fit=crop&w=1200&q=80',
  '6h 15m', 3, 'Intermediate',
  '["Match firmware, model numbers, and service files before starting a job","Use PC tools for backup, restore, and common software repairs","Record customer approvals and complete post-service device checks"]'::jsonb,
  3
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  thumbnail = excluded.thumbnail,
  duration_label = excluded.duration_label,
  lesson_count = excluded.lesson_count,
  level = excluded.level,
  objectives = excluded.objectives,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.course_lessons (id, course_id, sort_order, title, description) values
('par-l1', 'professional-android-repair', 1, 'Bench setup & opening', 'Workspace, tools, and safe disassembly.'),
('par-l2', 'professional-android-repair', 2, 'Display & touch faults', 'Diagnose and confirm display-related issues.'),
('par-l3', 'professional-android-repair', 3, 'Power, charging & handover', 'Charging port, battery service, and final checks.'),
('pir-l1', 'professional-ios-repair', 1, 'Opening & preparation', 'Tools, heat, and housing separation.'),
('pir-l2', 'professional-ios-repair', 2, 'Display replacement', 'Screen removal and assembly testing.'),
('pir-l3', 'professional-ios-repair', 3, 'Battery & verification', 'Battery swap and post-repair checks.'),
('cmst-l1', 'complete-mobile-software-training', 1, 'Workspace & firmware', 'PC setup and matching firmware files.'),
('cmst-l2', 'complete-mobile-software-training', 2, 'Flashing & recovery', 'Download mode and verified flash workflow.'),
('cmst-l3', 'complete-mobile-software-training', 3, 'Service jobs & handover', 'Account workflows and customer sign-off.')
on conflict (id) do update set
  course_id = excluded.course_id,
  sort_order = excluded.sort_order,
  title = excluded.title,
  description = excluded.description;

insert into public.lesson_items (
  id, lesson_id, sort_order, type, title, description, duration, video_url, material_url, material_format
) values
('par-1', 'par-l1', 1, 'video', 'Android Repair Bench Setup', 'Tools, ESD protection, lighting, and the order of work for every Android job.', '18 min', 'https://www.w3schools.com/html/mov_bbb.mp4', null, null),
('par-2', 'par-l1', 2, 'material', 'Android Disassembly Reference Guide', 'Back cover removal, screw maps, and flex cable handling notes.', null, null, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf'),
('par-3', 'par-l2', 1, 'video', 'Display and Touch Fault Diagnosis', 'Separate glass damage from full assembly faults and confirm touch response.', '24 min', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', null, null),
('par-4', 'par-l3', 1, 'video', 'Charging Port and Battery Service', 'Port cleaning, flex replacement, and safe battery swap practices.', '21 min', 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4', null, null),
('par-5', 'par-l3', 2, 'material', 'Pre-Delivery Test Checklist', 'Power, network, sensors, audio, and customer sign-off checklist.', null, null, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80', 'image'),
('pir-1', 'pir-l1', 1, 'video', 'iPhone Opening Tools and Safety', 'Tool selection, heat control, and safe separation for iPhone housings.', '16 min', 'https://storage.googleapis.com/exoplayer-test-media-1/mp4/android-screens-10s.mp4', null, null),
('pir-2', 'pir-l1', 2, 'material', 'iPhone Screw Map and Opening Guide', 'Fastener layout, bracket notes, and cable routing reminders.', null, null, 'https://pdfobject.com/pdf/sample.pdf', 'pdf'),
('pir-3', 'pir-l2', 1, 'video', 'Display Replacement Walkthrough', 'Screen removal, transfer parts, and boot testing on a common iPhone model.', '28 min', 'https://www.w3schools.com/html/mov_bbb.mp4', null, null),
('pir-4', 'pir-l3', 1, 'video', 'Battery Service and Adhesive Removal', 'Pull-tab technique, adhesive cleanup, and fit checks after battery change.', '22 min', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', null, null),
('pir-5', 'pir-l3', 2, 'material', 'iOS Post-Repair Verification Sheet', 'Touch, camera, speaker, charging, and cosmetic inspection checklist.', null, null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', 'image'),
('cmst-1', 'cmst-l1', 1, 'video', 'Software Repair Workspace Setup', 'PC preparation, drivers, cables, and safe handling before software jobs.', '15 min', 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4', null, null),
('cmst-2', 'cmst-l1', 2, 'material', 'Firmware and Model Matching Guide', 'Build numbers, region codes, and file selection reference sheet.', null, null, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf'),
('cmst-3', 'cmst-l2', 1, 'video', 'Flashing and Recovery Workflow', 'Download mode, recovery mode, and verified flash procedure overview.', '26 min', 'https://storage.googleapis.com/exoplayer-test-media-1/mp4/android-screens-10s.mp4', null, null),
('cmst-4', 'cmst-l3', 1, 'video', 'Account, Pattern, and Service Unlock Basics', 'Legal intake checks and common software service scenarios on the bench.', '19 min', 'https://www.w3schools.com/html/mov_bbb.mp4', null, null),
('cmst-5', 'cmst-l3', 2, 'material', 'Software Job Handover Checklist', 'Customer approval, backup notes, and final device verification list.', null, null, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'image')
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  sort_order = excluded.sort_order,
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  duration = excluded.duration,
  video_url = excluded.video_url,
  material_url = excluded.material_url,
  material_format = excluded.material_format;
