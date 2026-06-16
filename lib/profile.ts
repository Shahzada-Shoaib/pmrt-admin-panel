import { createAdminClient } from "@/lib/supabase-admin";

export type ProfileDto = {
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

export async function fetchProfileByFirebaseUid(
  firebaseUid: string,
): Promise<ProfileDto | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("email, full_name, phone")
    .eq("firebase_uid", firebaseUid)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    email: data.email as string | null,
    full_name: data.full_name as string | null,
    phone: data.phone as string | null,
  };
}

export async function updateProfileByFirebaseUid(
  firebaseUid: string,
  input: { full_name: string; phone: string | null },
) {
  const supabase = createAdminClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("firebase_uid", firebaseUid);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
