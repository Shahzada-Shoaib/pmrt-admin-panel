"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminProfileRow, UserCourseAccessRow } from "@/lib/users-admin";

type UsersCourseAccessAdminProps = {
  profile: AdminProfileRow;
  courses: UserCourseAccessRow[];
};

export function UsersCourseAccessAdmin({ profile, courses }: UsersCourseAccessAdminProps) {
  const router = useRouter();
  const [rows, setRows] = useState(courses);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleAccess = async (courseId: string, currentlyUnlocked: boolean) => {
    setSavingId(courseId);
    setError(null);

    const method = currentlyUnlocked ? "DELETE" : "POST";
    const url = `/api/admin/users/${profile.id}/access/${encodeURIComponent(courseId)}`;

    try {
      const response = await fetch(url, { method });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update access.");
      }

      setRows((prev) =>
        prev.map((row) =>
          row.course_id === courseId ? { ...row, unlocked: !currentlyUnlocked } : row,
        ),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <p className="text-sm font-medium text-[var(--muted)]">Users</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">
          {profile.full_name || profile.email || "Student"}
        </h2>
        {profile.email ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{profile.email}</p>
        ) : null}
      </header>

      <div className="flex-1 p-8">
        <p className="mb-4 text-sm text-[var(--muted)]">
          Toggle course unlock for the mobile app. Locked users see lessons and items in lists but
          cannot play videos or open PDFs/images.
        </p>

        {error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="text-lg font-semibold">No published courses</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Publish a course first.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Lessons</th>
                  <th className="px-6 py-4 font-semibold">Access</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.course_id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold">{row.title}</p>
                      <p className="text-xs text-[var(--muted)]">{row.course_id}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">{row.level}</td>
                    <td className="px-6 py-4">{row.lesson_count}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={savingId === row.course_id}
                        onClick={() => void toggleAccess(row.course_id, row.unlocked)}
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                          row.unlocked
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {savingId === row.course_id
                          ? "Saving…"
                          : row.unlocked
                            ? "Unlocked — click to lock"
                            : "Locked — click to unlock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
