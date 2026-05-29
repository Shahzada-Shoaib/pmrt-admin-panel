import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchUserAccessAdmin } from "@/lib/users-admin";

type RouteContext = { params: Promise<{ profileId: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(_request: Request, context: RouteContext) {
  const { profileId } = await context.params;
  const access = await fetchUserAccessAdmin(profileId);

  if (!access) {
    return jsonResponse({ error: "Could not load course access." }, 503);
  }

  return jsonResponse(access);
}
