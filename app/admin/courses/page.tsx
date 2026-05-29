import Image from "next/image";
import Link from "next/link";

import { fetchAllCoursesAdmin } from "@/lib/courses-admin";

export default async function AdminCoursesPage() {
  const courses = (await fetchAllCoursesAdmin()) ?? [];

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Content</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Courses</h2>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--primary)]/30 transition hover:bg-[var(--primary-dark)]"
        >
          + New course
        </Link>
      </header>

      <main className="flex-1 p-8">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="text-lg font-semibold">No courses yet</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Create your first course or run supabase/courses.sql for sample data.
            </p>
            <Link
              href="/admin/courses/new"
              className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Add course
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Lessons</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-[var(--muted)]">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {course.title}
                          </p>
                          <p className="text-xs text-[var(--muted)]">{course.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">{course.level}</td>
                    <td className="px-6 py-4">{course.lesson_count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          course.is_published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/courses/${encodeURIComponent(course.id)}`}
                        className="font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
