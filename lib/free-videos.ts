import { createAdminClient } from "@/lib/supabase-admin";

export type FreeVideoDto = {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
};

type FreeVideoRow = {
  id: string;
  title: string;
  duration_label: string;
  video_url: string;
  sort_order: number;
};

function mapRow(row: FreeVideoRow): FreeVideoDto {
  return {
    id: row.id,
    title: row.title,
    duration: row.duration_label,
    videoUrl: row.video_url,
  };
}

export async function fetchPublishedFreeVideos(): Promise<FreeVideoDto[] | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("free_videos")
    .select("id, title, duration_label, video_url, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetch free videos failed:", error.message);
    return null;
  }

  return ((data ?? []) as FreeVideoRow[]).map(mapRow);
}
