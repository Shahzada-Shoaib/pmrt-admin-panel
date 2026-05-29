import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  createStudyMaterial,
  fetchAllStudyMaterialsAdmin,
  slugifyTitle,
  type StudyMaterialInput,
} from "@/lib/study-materials-admin";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const materials = await fetchAllStudyMaterialsAdmin();
  if (!materials) {
    return jsonResponse({ error: "Could not load study materials." }, 503);
  }
  return jsonResponse(materials);
}

export async function POST(request: Request) {
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

  const format = body.material_format === "pdf" ? "pdf" : "image";

  const input: StudyMaterialInput = {
    id: slugifyTitle(body.id?.trim() || title),
    title,
    material_url: materialUrl,
    material_format: format,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    is_published: body.is_published ?? false,
  };

  const result = await createStudyMaterial(input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true, id: input.id }, 201);
}
