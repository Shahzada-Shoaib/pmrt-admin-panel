import Link from "next/link";

import { fetchAllProfilesAdmin } from "@/lib/users-admin";

export default async function AdminUsersPage() {
  const users = (await fetchAllProfilesAdmin()) ?? [];

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Students</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Users</h2>
        </div>
      </header>

      <main className="flex-1 p-8">
        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="text-lg font-semibold">No users yet</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Users appear after they sign in on the mobile app (profile sync).
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {user.full_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">{user.email || "—"}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
                      >
                        Manage access →
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
