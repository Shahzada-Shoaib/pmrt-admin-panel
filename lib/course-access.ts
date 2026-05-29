import { createAdminClient } from "@/lib/supabase-admin";

function getClient() {
  return createAdminClient();
}

export async function getProfileIdByFirebaseUid(
  firebaseUid: string,
): Promise<string | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("firebase_uid", firebaseUid)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.id as string;
}

export async function getUnlockedCourseIdsForProfile(
  profileId: string,
): Promise<Set<string>> {
  const supabase = getClient();
  if (!supabase) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("course_access")
    .select("course_id")
    .eq("profile_id", profileId);

  if (error) {
    console.error("fetch course access failed:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.course_id as string));
}

export async function hasCourseAccess(
  profileId: string,
  courseId: string,
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("course_access")
    .select("course_id")
    .eq("profile_id", profileId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    console.error("check course access failed:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function grantCourseAccess(profileId: string, courseId: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase.from("course_access").upsert(
    {
      profile_id: profileId,
      course_id: courseId,
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,course_id" },
  );

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function revokeCourseAccess(profileId: string, courseId: string) {
  const supabase = getClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }

  const { error } = await supabase
    .from("course_access")
    .delete()
    .eq("profile_id", profileId)
    .eq("course_id", courseId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
