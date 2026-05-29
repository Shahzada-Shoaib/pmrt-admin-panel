import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { grantCourseAccess, revokeCourseAccess } from "@/lib/course-access";
import { fetchProfileByIdAdmin } from "@/lib/users-admin";

type RouteContext = { params: Promise<{ profileId: string; courseId: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(_request: Request, context: RouteContext) {
  const { profileId, courseId } = await context.params;

  const profile = await fetchProfileByIdAdmin(profileId);
  if (!profile) {
    return jsonResponse({ error: "User not found." }, 404);
  }

  const result = await grantCourseAccess(profileId, courseId);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true }, 201);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { profileId, courseId } = await context.params;

  const profile = await fetchProfileByIdAdmin(profileId);
  if (!profile) {
    return jsonResponse({ error: "User not found." }, 404);
  }

  const result = await revokeCourseAccess(profileId, courseId);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}
