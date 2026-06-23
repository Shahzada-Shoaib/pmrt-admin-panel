import { createAdminClient } from "@/lib/supabase-admin";

export type AppBannerDto = {
  id: string;
  placement: "login" | "home";
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
};

type AppBannerRow = {
  id: string;
  placement: "login" | "home";
  title: string | null;
  subtitle: string | null;
  image_url: string;
  sort_order: number;
};

function mapRow(row: AppBannerRow): AppBannerDto {
  return {
    id: row.id,
    placement: row.placement,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
  };
}

export async function fetchPublishedAppBanners(): Promise<AppBannerDto[] | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_banners")
    .select("id, placement, title, subtitle, image_url, sort_order")
    .eq("is_active", true)
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetch app banners failed:", error.message);
    return null;
  }

  return ((data ?? []) as AppBannerRow[]).map(mapRow);
}
