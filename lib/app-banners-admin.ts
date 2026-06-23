import { createAdminClient } from "@/lib/supabase-admin";

export type BannerPlacement = "login" | "home";

export type AdminAppBannerRow = {
  id: string;
  placement: BannerPlacement;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export type AppBannerInput = {
  id: string;
  placement: BannerPlacement;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

function getClient() {
  return createAdminClient();
}

export function slugifyBannerId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function fetchAllAppBannersAdmin(): Promise<AdminAppBannerRow[] | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_banners")
    .select("id, placement, title, subtitle, image_url, sort_order, is_active")
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("admin fetch app banners:", error.message);
    return null;
  }

  return (data ?? []) as AdminAppBannerRow[];
}

export async function createAppBanner(input: AppBannerInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("app_banners").insert(input);
  return { error: error?.message ?? null };
}

export async function updateAppBanner(id: string, input: AppBannerInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("app_banners")
    .update({
      placement: input.placement,
      title: input.title,
      subtitle: input.subtitle,
      image_url: input.image_url,
      sort_order: input.sort_order,
      is_active: input.is_active,
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteAppBanner(id: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("app_banners").delete().eq("id", id);
  return { error: error?.message ?? null };
}
