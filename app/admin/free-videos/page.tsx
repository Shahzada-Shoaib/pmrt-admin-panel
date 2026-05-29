import { FreeVideosAdmin } from "@/components/admin/FreeVideosAdmin";
import { fetchAllFreeVideosAdmin } from "@/lib/free-videos-admin";

export default async function AdminFreeVideosPage() {
  const videos = (await fetchAllFreeVideosAdmin()) ?? [];

  return <FreeVideosAdmin videos={videos} />;
}
