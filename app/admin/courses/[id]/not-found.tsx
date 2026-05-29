import Link from "next/link";

export default function CourseNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold">Course not found</h2>
      <p className="mt-3 max-w-md text-sm text-[var(--muted)]">
        This course may have been deleted, or the course ID in the URL is invalid. Use a
        simple slug without spaces (e.g. <code className="text-[var(--primary)]">android-repair</code>
        ).
      </p>
      <Link
        href="/admin/courses"
        className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to courses
      </Link>
    </main>
  );
}
