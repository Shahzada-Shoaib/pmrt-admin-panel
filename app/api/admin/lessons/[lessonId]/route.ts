import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  deleteLessonContainer,
  updateLessonContainer,
  type LessonContainerInput,
} from "@/lib/courses-admin";

type RouteContext = { params: Promise<{ lessonId: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { lessonId } = await context.params;
  let body: Partial<LessonContainerInput>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const title = body.title?.trim();
  if (!title) {
    return jsonResponse({ error: "title is required." }, 400);
  }

  const input: LessonContainerInput = {
    id: lessonId,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    title,
    description: body.description?.trim() || "",
    is_preview: body.is_preview === true,
  };

  const result = await updateLessonContainer(lessonId, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { lessonId } = await context.params;
  const result = await deleteLessonContainer(lessonId);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }
  return jsonResponse({ ok: true });
}
