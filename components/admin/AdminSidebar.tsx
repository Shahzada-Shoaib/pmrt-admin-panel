"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "◉" },
  { href: "/admin/courses", label: "Courses", icon: "▣" },
  { href: "/admin/banners", label: "Banners", icon: "▤" },
  { href: "/admin/free-videos", label: "Free Videos", icon: "▶" },
  { href: "/admin/study-materials", label: "Free Study Material", icon: "◇" },
  { href: "/admin/users", label: "Users", icon: "◎" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[var(--sidebar)] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-light)]">
          PMRT
        </p>
        <h1 className="mt-1 text-lg font-bold tracking-tight">Institute Admin</h1>
        <p className="mt-1 text-sm text-[var(--sidebar-muted)]">
          Courses & mobile content
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base opacity-80">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-[var(--sidebar-muted)]">
        Mobile: courses, free videos, and study materials APIs.
      </div>
    </aside>
  );
}
