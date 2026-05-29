import { StudyMaterialsAdmin } from "@/components/admin/StudyMaterialsAdmin";
import { fetchAllStudyMaterialsAdmin } from "@/lib/study-materials-admin";

export default async function AdminStudyMaterialsPage() {
  const materials = (await fetchAllStudyMaterialsAdmin()) ?? [];

  return <StudyMaterialsAdmin materials={materials} />;
}
