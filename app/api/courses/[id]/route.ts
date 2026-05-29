import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchCourseById } from "@/lib/courses";
import { getFirebaseUidFromRequest } from "@/lib/verify-firebase-token";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const firebaseUid = getFirebaseUidFromRequest(request);
  const course = await fetchCourseById(id, firebaseUid);

  if (!course) {
    return jsonResponse({ error: "Course not found." }, 404);
  }

  return jsonResponse(course);
}
