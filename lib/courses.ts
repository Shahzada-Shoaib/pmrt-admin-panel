import { createAdminClient } from "@/lib/supabase-admin";

export type CourseContentDto = {
  id: string;
  title: string;
  type: "video" | "material";
  duration?: string;
  description: string;
  videoUrl?: string;
  materialUrl?: string;
  materialFormat?: "image" | "pdf";
};

export type CourseDto = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  thumbnail: string;
  duration: string;
  lessonCount: number;
  level: string;
  objectives: string[];
  content: CourseContentDto[];
};

type CourseRow = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  thumbnail: string;
  duration_label: string;
  lesson_count: number;
  level: string;
  objectives: string[] | null;
};

type LessonRow = {
  id: string;
  course_id: string;
  sort_order: number;
  type: "video" | "material";
  title: string;
  description: string;
  duration: string | null;
  video_url: string | null;
  material_url: string | null;
  material_format: "image" | "pdf" | null;
};

function mapLesson(row: LessonRow): CourseContentDto {
  const item: CourseContentDto = {
    id: row.id,
    title: row.title,
    type: row.type,
    description: row.description,
  };

  if (row.duration) {
    item.duration = row.duration;
  }
  if (row.video_url) {
    item.videoUrl = row.video_url;
  }
  if (row.material_url) {
    item.materialUrl = row.material_url;
  }
  if (row.material_format) {
    item.materialFormat = row.material_format;
  }

  return item;
}

function mapCourse(row: CourseRow, lessons: LessonRow[] = []): CourseDto {
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
    content: lessons.map(mapLesson),
  };
}

export async function fetchPublishedCourses(): Promise<CourseDto[] | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, instructor, description, thumbnail, duration_label, lesson_count, level, objectives",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("fetch courses failed:", error?.message);
    return null;
  }

  return (data as CourseRow[]).map((row) => mapCourse(row));
}

export async function fetchCourseById(
  courseId: string,
): Promise<CourseDto | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      "id, title, instructor, description, thumbnail, duration_label, lesson_count, level, objectives",
    )
    .eq("id", courseId)
    .eq("is_published", true)
    .maybeSingle();

  if (courseError || !course) {
    console.error("fetch course failed:", courseError?.message);
    return null;
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("course_lessons")
    .select(
      "id, course_id, sort_order, type, title, description, duration, video_url, material_url, material_format",
    )
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (lessonsError) {
    console.error("fetch lessons failed:", lessonsError.message);
    return null;
  }

  return mapCourse(course as CourseRow, (lessons ?? []) as LessonRow[]);
}
