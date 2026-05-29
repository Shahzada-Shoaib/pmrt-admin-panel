import { createAdminClient } from "@/lib/supabase-admin";

export type AdminStudyMaterialRow = {
  id: string;
  title: string;
  material_url: string;
  material_format: "image" | "pdf";
  sort_order: number;
  is_published: boolean;
};

export type StudyMaterialInput = {
  id: string;
  title: string;
  material_url: string;
  material_format: "image" | "pdf";
  sort_order: number;
  is_published: boolean;
};

function getClient() {
  return createAdminClient();
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function fetchAllStudyMaterialsAdmin(): Promise<AdminStudyMaterialRow[] | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("study_materials")
    .select("id, title, material_url, material_format, sort_order, is_published")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("admin fetch study materials:", error.message);
    return null;
  }

  return (data ?? []) as AdminStudyMaterialRow[];
}

export async function createStudyMaterial(input: StudyMaterialInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("study_materials").insert({
    id: input.id,
    title: input.title,
    material_url: input.material_url,
    material_format: input.material_format,
    sort_order: input.sort_order,
    is_published: input.is_published,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateStudyMaterial(id: string, input: StudyMaterialInput) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("study_materials")
    .update({
      title: input.title,
      material_url: input.material_url,
      material_format: input.material_format,
      sort_order: input.sort_order,
      is_published: input.is_published,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteStudyMaterial(id: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("study_materials").delete().eq("id", id);
  return { error: error?.message ?? null };
}
