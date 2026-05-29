import { createAdminClient } from "@/lib/supabase-admin";
import type { CourseContentDto, CourseDto } from "@/lib/courses";

export type AdminCourseRow = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  thumbnail: string;
  duration_label: string;
  lesson_count: number;
  level: string;
  objectives: string[] | null;
  is_published: boolean;
  sort_order: number;
};

export type LessonInput = {
  id: string;
  sort_order: number;
  type: "video" | "material";
  title: string;
  description: string;
  duration?: string | null;
  video_url?: string | null;
  material_url?: string | null;
  material_format?: "image" | "pdf" | null;
};

export type CourseInput = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  thumbnail: string;
  duration_label: string;
  level: string;
  objectives: string[];
  is_published: boolean;
  sort_order: number;
};

function getClient() {
  return createAdminClient();
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function recalculateLessonCount(courseId: string) {
  const supabase = getClient();
  if (!supabase) {
    return;
  }

  const { count } = await supabase
    .from("course_lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  await supabase
    .from("courses")
    .update({ lesson_count: count ?? 0, updated_at: new Date().toISOString() })
    .eq("id", courseId);
}

export async function fetchAllCoursesAdmin(): Promise<AdminCourseRow[] | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, instructor, description, thumbnail, duration_label, lesson_count, level, objectives, is_published, sort_order",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("admin fetch courses:", error.message);
    return null;
  }

  return (data ?? []) as AdminCourseRow[];
}

export async function fetchCourseAdminFull(
  courseId: string,
): Promise<(CourseDto & { isPublished: boolean; sortOrder: number }) | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, title, instructor, description, thumbnail, duration_label, lesson_count, level, objectives, is_published, sort_order",
    )
    .eq("id", courseId)
    .maybeSingle();

  if (error || !course) {
    return null;
  }

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select(
      "id, course_id, sort_order, type, title, description, duration, video_url, material_url, material_format",
    )
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const row = course as AdminCourseRow;
  const content: CourseContentDto[] = (lessons ?? []).map((lesson) => {
    const item: CourseContentDto = {
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      description: lesson.description,
    };
    if (lesson.duration) item.duration = lesson.duration;
    if (lesson.video_url) item.videoUrl = lesson.video_url;
    if (lesson.material_url) item.materialUrl = lesson.material_url;
    if (lesson.material_format) item.materialFormat = lesson.material_format;
    return item;
  });

  return {
    id: row.id,
    title: row.title,
    instructor: row.instructor,
    description: row.description,
    thumbnail: row.thumbnail,
    duration: row.duration_label,
    lessonCount: row.lesson_count,
    level: row.level,
    objectives: row.objectives ?? [],
    content,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export async function createCourse(input: CourseInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("courses").insert({
    id: input.id,
    title: input.title,
    instructor: input.instructor,
    description: input.description,
    thumbnail: input.thumbnail,
    duration_label: input.duration_label,
    lesson_count: 0,
    level: input.level,
    objectives: input.objectives,
    is_published: input.is_published,
    sort_order: input.sort_order,
    created_at: now,
    updated_at: now,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateCourse(courseId: string, input: CourseInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("courses")
    .update({
      title: input.title,
      instructor: input.instructor,
      description: input.description,
      thumbnail: input.thumbnail,
      duration_label: input.duration_label,
      level: input.level,
      objectives: input.objectives,
      is_published: input.is_published,
      sort_order: input.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteCourse(courseId: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  return { error: error?.message ?? null };
}

export async function createLesson(courseId: string, input: LessonInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("course_lessons").insert({
    id: input.id,
    course_id: courseId,
    sort_order: input.sort_order,
    type: input.type,
    title: input.title,
    description: input.description,
    duration: input.duration ?? null,
    video_url: input.video_url ?? null,
    material_url: input.material_url ?? null,
    material_format: input.material_format ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  await recalculateLessonCount(courseId);
  return { error: null };
}

export async function updateLesson(lessonId: string, input: LessonInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { data: existing } = await supabase
    .from("course_lessons")
    .select("course_id")
    .eq("id", lessonId)
    .maybeSingle();

  const { error } = await supabase
    .from("course_lessons")
    .update({
      sort_order: input.sort_order,
      type: input.type,
      title: input.title,
      description: input.description,
      duration: input.duration ?? null,
      video_url: input.video_url ?? null,
      material_url: input.material_url ?? null,
      material_format: input.material_format ?? null,
    })
    .eq("id", lessonId);

  if (error) {
    return { error: error.message };
  }

  if (existing?.course_id) {
    await recalculateLessonCount(existing.course_id);
  }

  return { error: null };
}

export async function deleteLesson(lessonId: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { data: existing } = await supabase
    .from("course_lessons")
    .select("course_id")
    .eq("id", lessonId)
    .maybeSingle();

  const { error } = await supabase
    .from("course_lessons")
    .delete()
    .eq("id", lessonId);

  if (error) {
    return { error: error.message };
  }

  if (existing?.course_id) {
    await recalculateLessonCount(existing.course_id);
  }

  return { error: null };
}
