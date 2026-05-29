import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  deleteLessonItem,
  updateLessonItem,
  type LessonItemInput,
} from "@/lib/courses-admin";

type RouteContext = { params: Promise<{ itemId: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { itemId } = await context.params;
  let body: Partial<LessonItemInput>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const title = body.title?.trim();
  if (!title) {
    return jsonResponse({ error: "title is required." }, 400);
  }

  const type = body.type === "material" ? "material" : "video";
  const input: LessonItemInput = {
    id: itemId,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    type,
    title,
    description: body.description?.trim() || "",
    duration: body.duration ?? null,
    video_url: type === "video" ? body.video_url ?? null : null,
    material_url: type === "material" ? body.material_url ?? null : null,
    material_format:
      type === "material" ? (body.material_format === "pdf" ? "pdf" : "image") : null,
  };

  const result = await updateLessonItem(itemId, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { itemId } = await context.params;
  const result = await deleteLessonItem(itemId);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }
  return jsonResponse({ ok: true });
}
