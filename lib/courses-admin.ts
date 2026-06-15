import { createAdminClient } from "@/lib/supabase-admin";
import type { CourseDto, CourseLessonDto } from "@/lib/courses";
import { fetchCourseLessonsWithItems } from "@/lib/courses";

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

export type LessonContainerInput = {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  is_preview?: boolean;
};

export type LessonItemInput = {
  id: string;
  sort_order: number;
  type: "video" | "material";
  title: string;
  description: string;
  duration?: string | null;
  video_url?: string | null;
  material_url?: string | null;
  material_format?: "image" | "pdf" | null;
  is_preview?: boolean;
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

  const nested = await fetchCourseLessonsWithItems(courseId);
  const row = course as AdminCourseRow;

  const lessons: CourseLessonDto[] = (nested?.lessons ?? []).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    isPreview: lesson.is_preview ?? false,
    items: (nested?.items ?? [])
      .filter((item) => item.lesson_id === lesson.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => {
        const dto = {
          id: item.id,
          title: item.title,
          type: item.type,
          description: item.description,
        } as CourseLessonDto["items"][number];
        if (item.duration) dto.duration = item.duration;
        if (item.video_url) dto.videoUrl = item.video_url;
        if (item.material_url) dto.materialUrl = item.material_url;
        if (item.material_format) dto.materialFormat = item.material_format;
        dto.isPreview = item.is_preview ?? false;
        return dto;
      }),
  }));

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
    lessons,
    isUnlocked: true,
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

export async function createLessonContainer(courseId: string, input: LessonContainerInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("course_lessons").insert({
    id: input.id,
    course_id: courseId,
    sort_order: input.sort_order,
    title: input.title,
    description: input.description,
    is_preview: input.is_preview ?? false,
  });

  if (error) {
    return { error: error.message };
  }

  await recalculateLessonCount(courseId);
  return { error: null };
}

export async function updateLessonContainer(lessonId: string, input: LessonContainerInput) {
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
      title: input.title,
      description: input.description,
      is_preview: input.is_preview ?? false,
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

export async function deleteLessonContainer(lessonId: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { data: existing } = await supabase
    .from("course_lessons")
    .select("course_id")
    .eq("id", lessonId)
    .maybeSingle();

  const { error } = await supabase.from("course_lessons").delete().eq("id", lessonId);

  if (error) {
    return { error: error.message };
  }

  if (existing?.course_id) {
    await recalculateLessonCount(existing.course_id);
  }

  return { error: null };
}

export async function createLessonItem(lessonId: string, input: LessonItemInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("lesson_items").insert({
    id: input.id,
    lesson_id: lessonId,
    sort_order: input.sort_order,
    type: input.type,
    title: input.title,
    description: input.description,
    duration: input.duration ?? null,
    video_url: input.video_url ?? null,
    material_url: input.material_url ?? null,
    material_format: input.material_format ?? null,
    is_preview: input.is_preview ?? false,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateLessonItem(itemId: string, input: LessonItemInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("lesson_items")
    .update({
      sort_order: input.sort_order,
      type: input.type,
      title: input.title,
      description: input.description,
      duration: input.duration ?? null,
      video_url: input.video_url ?? null,
      material_url: input.material_url ?? null,
      material_format: input.material_format ?? null,
      is_preview: input.is_preview ?? false,
    })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteLessonItem(itemId: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("lesson_items").delete().eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
