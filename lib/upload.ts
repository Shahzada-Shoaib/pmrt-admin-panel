import { createAdminClient } from "@/lib/supabase-admin";

export async function uploadCourseAsset(file: File, folder: string) {
  const supabase = createAdminClient();
  if (!supabase) {
    return { error: "Supabase not configured.", url: null as string | null };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const path = `${folder}/${Date.now()}-${safeName || `file.${extension}`}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("course-assets").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    return { error: error.message, url: null };
  }

  const { data } = supabase.storage.from("course-assets").getPublicUrl(path);
  return { error: null, url: data.publicUrl };
}
