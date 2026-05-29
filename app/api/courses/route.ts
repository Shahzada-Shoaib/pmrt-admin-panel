import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchPublishedCourses } from "@/lib/courses";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const courses = await fetchPublishedCourses();

  if (!courses) {
    return jsonResponse(
      { error: "Could not load courses. Check Supabase env and run courses.sql." },
      503,
    );
  }

  return jsonResponse(courses);
}
