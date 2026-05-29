import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  deleteCourse,
  fetchCourseAdminFull,
  updateCourse,
  type CourseInput,
} from "@/lib/courses-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const course = await fetchCourseAdminFull(id);
  if (!course) {
    return jsonResponse({ error: "Course not found." }, 404);
  }
  return jsonResponse(course);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Partial<CourseInput>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const title = body.title?.trim();
  if (!title) {
    return jsonResponse({ error: "title is required." }, 400);
  }

  const input: CourseInput = {
    id,
    title,
    instructor: body.instructor?.trim() || "PMRT Faculty",
    description: body.description?.trim() || "",
    thumbnail: body.thumbnail?.trim() || "",
    duration_label: body.duration_label?.trim() || "0h",
    level: body.level?.trim() || "Beginner",
    objectives: Array.isArray(body.objectives) ? body.objectives : [],
    is_published: body.is_published ?? false,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
  };

  const result = await updateCourse(id, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await deleteCourse(id);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }
  return jsonResponse({ ok: true });
}
