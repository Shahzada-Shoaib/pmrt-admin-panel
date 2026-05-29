import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  createCourse,
  fetchAllCoursesAdmin,
  slugifyTitle,
  type CourseInput,
} from "@/lib/courses-admin";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const courses = await fetchAllCoursesAdmin();
  if (!courses) {
    return jsonResponse({ error: "Could not load courses." }, 503);
  }
  return jsonResponse(courses);
}

export async function POST(request: Request) {
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
    id: slugifyTitle(body.id?.trim() || title),
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

  const result = await createCourse(input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true, id: input.id }, 201);
}
