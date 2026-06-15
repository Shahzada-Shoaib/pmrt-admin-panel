import { getProfileIdByFirebaseUid, getUnlockedCourseIdsForProfile } from "@/lib/course-access";
import { applyLockedCourseMediaPolicy } from "@/lib/lesson-item-access";
import { createAdminClient } from "@/lib/supabase-admin";

export type LessonItemDto = {
  id: string;
  title: string;
  type: "video" | "material";
  description: string;
  duration?: string;
  videoUrl?: string;
  materialUrl?: string;
  materialFormat?: "image" | "pdf";
  isPreview?: boolean;
};

export type CourseLessonDto = {
  id: string;
  title: string;
  description: string;
  items: LessonItemDto[];
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
  lessons: CourseLessonDto[];
  isUnlocked: boolean;
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
  title: string;
  description: string;
};

type ItemRow = {
  id: string;
  lesson_id: string;
  sort_order: number;
  type: "video" | "material";
  title: string;
  description: string;
  duration: string | null;
  video_url: string | null;
  material_url: string | null;
  material_format: "image" | "pdf" | null;
  is_preview: boolean;
};

function mapItem(row: ItemRow): LessonItemDto {
  const item: LessonItemDto = {
    id: row.id,
    title: row.title,
    type: row.type,
    description: row.description,
    isPreview: row.is_preview ?? false,
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

function mapLessons(lessonRows: LessonRow[], itemRows: ItemRow[]): CourseLessonDto[] {
  const itemsByLesson = new Map<string, ItemRow[]>();

  for (const row of itemRows) {
    const list = itemsByLesson.get(row.lesson_id) ?? [];
    list.push(row);
    itemsByLesson.set(row.lesson_id, list);
  }

  return lessonRows.map((lesson) => {
    const items = (itemsByLesson.get(lesson.id) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapItem);

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      items,
    };
  });
}

function mapCourse(
  row: CourseRow,
  lessonRows: LessonRow[] = [],
  itemRows: ItemRow[] = [],
  isUnlocked = false,
): CourseDto {
  const lessons = mapLessons(
    [...lessonRows].sort((a, b) => a.sort_order - b.sort_order),
    itemRows,
  );

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
    isUnlocked,
  };
}

async function fetchLessonItemsForCourse(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
  courseId: string,
  lessonIds: string[],
): Promise<ItemRow[]> {
  if (lessonIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("lesson_items")
    .select(
      "id, lesson_id, sort_order, type, title, description, duration, video_url, material_url, material_format, is_preview",
    )
    .in("lesson_id", lessonIds)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetch lesson items failed:", error.message);
    return [];
  }

  return (data ?? []) as ItemRow[];
}

export async function fetchPublishedCourses(
  firebaseUid?: string | null,
): Promise<CourseDto[] | null> {
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

  let unlockedIds = new Set<string>();
  if (firebaseUid) {
    const profileId = await getProfileIdByFirebaseUid(firebaseUid);
    if (profileId) {
      unlockedIds = await getUnlockedCourseIdsForProfile(profileId);
    }
  }

  return (data as CourseRow[]).map((row) =>
    mapCourse(row, [], [], unlockedIds.has(row.id)),
  );
}

export async function fetchCourseById(
  courseId: string,
  firebaseUid?: string | null,
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
    .select("id, course_id, sort_order, title, description")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (lessonsError) {
    console.error("fetch lessons failed:", lessonsError.message);
    return null;
  }

  const lessonRows = (lessons ?? []) as LessonRow[];
  const itemRows = await fetchLessonItemsForCourse(
    supabase,
    courseId,
    lessonRows.map((l) => l.id),
  );

  let isUnlocked = false;
  if (firebaseUid) {
    const profileId = await getProfileIdByFirebaseUid(firebaseUid);
    if (profileId) {
      const unlockedIds = await getUnlockedCourseIdsForProfile(profileId);
      isUnlocked = unlockedIds.has(courseId);
    }
  }

  const full = mapCourse(course as CourseRow, lessonRows, itemRows, isUnlocked);
  return applyLockedCourseMediaPolicy(full);
}

export async function fetchCourseLessonsWithItems(
  courseId: string,
): Promise<{ lessons: LessonRow[]; items: ItemRow[] } | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("course_lessons")
    .select("id, course_id, sort_order, title, description")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (lessonsError) {
    console.error("fetch lessons failed:", lessonsError.message);
    return null;
  }

  const lessonRows = (lessons ?? []) as LessonRow[];
  const itemRows = await fetchLessonItemsForCourse(
    supabase,
    courseId,
    lessonRows.map((l) => l.id),
  );

  return { lessons: lessonRows, items: itemRows };
}
