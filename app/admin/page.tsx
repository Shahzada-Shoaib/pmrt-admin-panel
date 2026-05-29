import Link from "next/link";

import { fetchAllCoursesAdmin } from "@/lib/courses-admin";
import { fetchAllFreeVideosAdmin } from "@/lib/free-videos-admin";
import { fetchAllStudyMaterialsAdmin } from "@/lib/study-materials-admin";
import { fetchAllProfilesAdmin } from "@/lib/users-admin";

export default async function AdminDashboardPage() {
  const [courses, freeVideos, studyMaterials, users] = await Promise.all([
    fetchAllCoursesAdmin(),
    fetchAllFreeVideosAdmin(),
    fetchAllStudyMaterialsAdmin(),
    fetchAllProfilesAdmin(),
  ]);
  const courseList = courses ?? [];
  const videoList = freeVideos ?? [];
  const materialList = studyMaterials ?? [];
  const userList = users ?? [];
  const published = courseList.filter((c) => c.is_published).length;

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <p className="text-sm font-medium text-[var(--muted)]">Welcome back</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Dashboard
        </h2>
      </header>
      <main className="flex-1 p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Total courses</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {courseList.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Published</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">{published}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Draft</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {courseList.length - published}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Free videos</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{videoList.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Study materials</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {materialList.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Registered users</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{userList.length}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          <h3 className="text-lg font-semibold">Quick actions</h3>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Create and publish courses. The mobile app shows only published programs.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--primary)]/30 transition hover:bg-[var(--primary-dark)]"
            >
              Add new course
            </Link>
            <Link
              href="/admin/courses"
              className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-slate-50"
            >
              Manage courses
            </Link>
            <Link
              href="/admin/free-videos"
              className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-slate-50"
            >
              Free videos
            </Link>
            <Link
              href="/admin/study-materials"
              className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-slate-50"
            >
              Study materials
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-slate-50"
            >
              Manage users
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
