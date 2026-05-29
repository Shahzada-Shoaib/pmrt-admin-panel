import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchPublishedFreeVideos } from "@/lib/free-videos";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const videos = await fetchPublishedFreeVideos();

  if (!videos) {
    return jsonResponse(
      { error: "Could not load free videos. Check Supabase env and run free-content.sql." },
      503,
    );
  }

  return jsonResponse(videos);
}
