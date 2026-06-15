import type { CourseDto, LessonItemDto } from "@/lib/courses";

/** Preview items stay available when the course is not unlocked for the user. */
export function isLessonItemAccessible(
  courseUnlocked: boolean,
  itemPreview: boolean,
  lessonPreview = false,
): boolean {
  return courseUnlocked || itemPreview || lessonPreview;
}

function stripItemMedia(item: LessonItemDto): LessonItemDto {
  const stripped: LessonItemDto = {
    id: item.id,
    title: item.title,
    type: item.type,
    description: item.description,
    isPreview: item.isPreview ?? false,
  };

  if (item.duration) {
    stripped.duration = item.duration;
  }
  if (item.materialFormat) {
    stripped.materialFormat = item.materialFormat;
  }

  return stripped;
}

/** Hide media URLs for locked items; keep preview items intact. */
export function applyLockedCourseMediaPolicy(course: CourseDto): CourseDto {
  if (course.isUnlocked) {
    return course;
  }

  return {
    ...course,
    isUnlocked: false,
    lessons: course.lessons.map((lesson) => {
      const lessonPreview = lesson.isPreview ?? false;
      return {
        ...lesson,
        items: lesson.items.map((item) => {
          const itemPreview = item.isPreview ?? false;
          return isLessonItemAccessible(false, itemPreview, lessonPreview)
            ? item
            : stripItemMedia(item);
        }),
      };
    }),
  };
}
