import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchAllProfilesAdmin } from "@/lib/users-admin";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const users = await fetchAllProfilesAdmin();
  if (!users) {
    return jsonResponse({ error: "Could not load users." }, 503);
  }
  return jsonResponse(users);
}
