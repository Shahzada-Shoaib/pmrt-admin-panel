import { AppBannersAdmin } from "@/components/admin/AppBannersAdmin";
import { fetchAllAppBannersAdmin } from "@/lib/app-banners-admin";

export default async function AdminBannersPage() {
  const banners = (await fetchAllAppBannersAdmin()) ?? [];

  return <AppBannersAdmin banners={banners} />;
}
