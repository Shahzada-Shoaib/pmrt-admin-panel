import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  createLessonContainer,
  slugifyTitle,
  type LessonContainerInput,
} from "@/lib/courses-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: courseId } = await context.params;
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
    id: body.id?.trim() || `${slugifyTitle(title)}-${Date.now()}`,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    title,
    description: body.description?.trim() || "",
    is_preview: body.is_preview === true,
  };

  const result = await createLessonContainer(courseId, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true, id: input.id }, 201);
}
