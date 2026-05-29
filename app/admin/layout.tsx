import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "PMRT Institute Admin",
  description: "Manage courses for the PMRT mobile app",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
