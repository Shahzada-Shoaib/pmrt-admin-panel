import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchPublishedCourses } from "@/lib/courses";
import { getFirebaseUidFromRequest } from "@/lib/verify-firebase-token";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const firebaseUid = await getFirebaseUidFromRequest(request);
  const courses = await fetchPublishedCourses(firebaseUid);

  if (!courses) {
    return jsonResponse(
      { error: "Could not load courses. Check Supabase env and run courses.sql." },
      503,
    );
  }

  return jsonResponse(courses);
}
