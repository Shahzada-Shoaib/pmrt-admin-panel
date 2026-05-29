import { CourseEditor } from "@/components/admin/CourseEditor";

export default function NewCoursePage() {
  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <p className="text-sm font-medium text-[var(--muted)]">Courses</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">New course</h2>
      </header>
      <main className="flex-1 p-8">
        <CourseEditor mode="create" />
      </main>
    </>
  );
}
