import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import { fetchPublishedAppBanners } from "@/lib/app-banners";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const banners = await fetchPublishedAppBanners();
  if (!banners) {
    return jsonResponse({ error: "Could not load app banners." }, 503);
  }

  return jsonResponse({
    login: banners.filter((banner) => banner.placement === "login"),
    home: banners.filter((banner) => banner.placement === "home"),
  });
}
