import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  deleteStudyMaterial,
  updateStudyMaterial,
  type StudyMaterialInput,
} from "@/lib/study-materials-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Partial<StudyMaterialInput>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const title = body.title?.trim();
  if (!title) {
    return jsonResponse({ error: "title is required." }, 400);
  }

  const materialUrl = body.material_url?.trim() ?? "";
  if (!materialUrl || materialUrl.startsWith("data:")) {
    return jsonResponse({ error: "A valid material URL is required." }, 400);
  }

  const input: StudyMaterialInput = {
    id,
    title,
    material_url: materialUrl,
    material_format: body.material_format === "pdf" ? "pdf" : "image",
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    is_published: body.is_published ?? false,
  };

  const result = await updateStudyMaterial(id, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await deleteStudyMaterial(id);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }
  return jsonResponse({ ok: true });
}
