import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  createAppBanner,
  fetchAllAppBannersAdmin,
  slugifyBannerId,
  type AppBannerInput,
  type BannerPlacement,
} from "@/lib/app-banners-admin";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const banners = await fetchAllAppBannersAdmin();
  if (!banners) {
    return jsonResponse({ error: "Could not load banners." }, 503);
  }
  return jsonResponse(banners);
}

export async function POST(request: Request) {
  let body: Partial<AppBannerInput>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const placement = body.placement === "home" ? "home" : "login";
  const imageUrl = body.image_url?.trim() ?? "";
  if (!imageUrl || imageUrl.startsWith("data:")) {
    return jsonResponse({ error: "A valid image URL is required." }, 400);
  }

  const title = body.title?.trim() || null;
  const fallbackId = `${placement}-${title || Date.now()}`;
  const input: AppBannerInput = {
    id: slugifyBannerId(body.id?.trim() || fallbackId),
    placement: placement as BannerPlacement,
    title,
    subtitle: body.subtitle?.trim() || null,
    image_url: imageUrl,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    is_active: body.is_active ?? true,
  };

  const result = await createAppBanner(input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true, id: input.id }, 201);
}
