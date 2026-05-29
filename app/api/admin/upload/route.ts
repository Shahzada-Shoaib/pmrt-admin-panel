import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { uploadCourseAsset } from "@/lib/upload";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: "Invalid form data." }, 400);
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string | null) ?? "misc";

  if (!(file instanceof File) || file.size === 0) {
    return jsonResponse({ error: "file is required." }, 400);
  }

  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return jsonResponse({ error: "File must be under 15 MB." }, 400);
  }

  const result = await uploadCourseAsset(file, folder);
  if (result.error || !result.url) {
    return jsonResponse(
      { error: result.error ?? "Upload failed. Run supabase/storage.sql first." },
      500,
    );
  }

  return jsonResponse({ ok: true, url: result.url });
}
