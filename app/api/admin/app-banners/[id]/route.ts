import { corsHeaders, jsonResponse } from "@/lib/api-cors";
import {
  deleteAppBanner,
  updateAppBanner,
  type AppBannerInput,
  type BannerPlacement,
} from "@/lib/app-banners-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
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

  const input: AppBannerInput = {
    id,
    placement: placement as BannerPlacement,
    title: body.title?.trim() || null,
    subtitle: body.subtitle?.trim() || null,
    image_url: imageUrl,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    is_active: body.is_active ?? true,
  };

  const result = await updateAppBanner(id, input);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await deleteAppBanner(id);
  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }
  return jsonResponse({ ok: true });
}
