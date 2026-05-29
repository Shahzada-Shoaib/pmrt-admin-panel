import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  deleteFreeVideo,
  updateFreeVideo,
  type FreeVideoInput,
} from "@/lib/free-videos-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Partial<FreeVideoInput>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const title = body.title?.trim();
  if (!title) {
    return jsonResponse({ error: "title is required." }, 400);
  }

  const videoUrl = body.video_url?.trim() ?? "";
  if (!videoUrl || videoUrl.startsWith("data:")) {
    return jsonResponse({ error: "A valid video URL is required." }, 400);
  }

  const input: FreeVideoInput = {
    id,
    title,
    duration_label: body.duration_label?.trim() || "",
    video_url: videoUrl,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    is_published: body.is_published ?? false,
  };

  const result = await updateFreeVideo(id, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await deleteFreeVideo(id);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }
  return jsonResponse({ ok: true });
}
