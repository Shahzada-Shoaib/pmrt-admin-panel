import { createAdminClient } from "@/lib/supabase-admin";

export type AdminFreeVideoRow = {
  id: string;
  title: string;
  duration_label: string;
  video_url: string;
  sort_order: number;
  is_published: boolean;
};

export type FreeVideoInput = {
  id: string;
  title: string;
  duration_label: string;
  video_url: string;
  sort_order: number;
  is_published: boolean;
};

function getClient() {
  return createAdminClient();
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function fetchAllFreeVideosAdmin(): Promise<AdminFreeVideoRow[] | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("free_videos")
    .select("id, title, duration_label, video_url, sort_order, is_published")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("admin fetch free videos:", error.message);
    return null;
  }

  return (data ?? []) as AdminFreeVideoRow[];
}

export async function createFreeVideo(input: FreeVideoInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("free_videos").insert({
    id: input.id,
    title: input.title,
    duration_label: input.duration_label,
    video_url: input.video_url,
    sort_order: input.sort_order,
    is_published: input.is_published,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateFreeVideo(id: string, input: FreeVideoInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("free_videos")
    .update({
      title: input.title,
      duration_label: input.duration_label,
      video_url: input.video_url,
      sort_order: input.sort_order,
      is_published: input.is_published,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteFreeVideo(id: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("free_videos").delete().eq("id", id);
  return { error: error?.message ?? null };
}
