import Link from "next/link";
import { notFound } from "next/navigation";

import { UsersCourseAccessAdmin } from "@/components/admin/UsersCourseAccessAdmin";
import { fetchProfileByIdAdmin, fetchUserAccessAdmin } from "@/lib/users-admin";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminUserAccessPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await fetchProfileByIdAdmin(id);

  if (!profile) {
    notFound();
  }

  const courses = (await fetchUserAccessAdmin(id)) ?? [];

  return (
    <>
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-8 py-3">
        <Link
          href="/admin/users"
          className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
        >
          ← Back to users
        </Link>
      </div>
      <UsersCourseAccessAdmin profile={profile} courses={courses} />
    </>
  );
}
