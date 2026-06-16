import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchProfileByFirebaseUid, updateProfileByFirebaseUid } from "@/lib/profile";
import { getFirebaseUidFromRequest } from "@/lib/verify-firebase-token";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const firebaseUid = getFirebaseUidFromRequest(request);
  if (!firebaseUid) {
    return jsonResponse({ error: "Missing X-Firebase-Uid header." }, 401);
  }

  const profile = await fetchProfileByFirebaseUid(firebaseUid);
  if (!profile) {
    return jsonResponse({ error: "Profile not found." }, 404);
  }

  return jsonResponse(profile);
}

export async function PATCH(request: Request) {
  const firebaseUid = getFirebaseUidFromRequest(request);
  if (!firebaseUid) {
    return jsonResponse({ error: "Missing X-Firebase-Uid header." }, 401);
  }

  let body: { full_name?: string; phone?: string | null };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const full_name = body.full_name?.trim();
  if (!full_name) {
    return jsonResponse({ error: "full_name is required." }, 400);
  }

  const phone = body.phone?.trim() || null;
  const result = await updateProfileByFirebaseUid(firebaseUid, { full_name, phone });
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true, full_name, phone });
}
