import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchCourseById } from "@/lib/courses";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const course = await fetchCourseById(id);

  if (!course) {
    return jsonResponse({ error: "Course not found." }, 404);
  }

  return jsonResponse(course);
}
