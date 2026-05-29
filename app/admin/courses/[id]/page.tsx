import { notFound } from "next/navigation";

import { CourseEditor } from "@/components/admin/CourseEditor";
import { LessonManager } from "@/components/admin/LessonManager";
import { fetchCourseAdminFull } from "@/lib/courses-admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const course = await fetchCourseAdminFull(id);

  if (!course) {
    notFound();
  }

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <p className="text-sm font-medium text-[var(--muted)]">Edit course</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{course.title}</h2>
      </header>
      <main className="flex-1 p-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <CourseEditor
            mode="edit"
            courseId={id}
            detailsOnly
            initial={{
              ...course,
              isPublished: course.isPublished,
              sortOrder: course.sortOrder,
            }}
          />
          <div className="lg:sticky lg:top-8">
            <LessonManager courseId={id} lessons={course.lessons} />
          </div>
        </div>
      </main>
    </>
  );
}
