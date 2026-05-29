import { createAdminClient } from "@/lib/supabase-admin";

export type StudyMaterialDto = {
  id: string;
  title: string;
  materialUrl: string;
  materialFormat: "image" | "pdf";
};

type StudyMaterialRow = {
  id: string;
  title: string;
  material_url: string;
  material_format: "image" | "pdf";
  sort_order: number;
};

function mapRow(row: StudyMaterialRow): StudyMaterialDto {
  return {
    id: row.id,
    title: row.title,
    materialUrl: row.material_url,
    materialFormat: row.material_format,
  };
}

export async function fetchPublishedStudyMaterials(): Promise<StudyMaterialDto[] | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("study_materials")
    .select("id, title, material_url, material_format, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetch study materials failed:", error.message);
    return null;
  }

  return ((data ?? []) as StudyMaterialRow[]).map(mapRow);
}
