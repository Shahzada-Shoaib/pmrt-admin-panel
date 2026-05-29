-- Run once in Supabase SQL Editor (after courses.sql)

insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do update set public = true;

-- Public read for course thumbnails and lesson files
create policy "Public read course assets"
on storage.objects for select
using (bucket_id = 'course-assets');
