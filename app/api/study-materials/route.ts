import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchPublishedStudyMaterials } from "@/lib/study-materials";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const materials = await fetchPublishedStudyMaterials();

  if (!materials) {
    return jsonResponse(
      { error: "Could not load study materials. Check Supabase env and run free-content.sql." },
      503,
    );
  }

  return jsonResponse(materials);
}
