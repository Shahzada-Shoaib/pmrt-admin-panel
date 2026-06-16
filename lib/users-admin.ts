import { createAdminClient } from "@/lib/supabase-admin";
import { getUnlockedCourseIdsForProfile } from "@/lib/course-access";

export type AdminProfileRow = {
  id: string;
  firebase_uid: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type UserCourseAccessRow = {
  course_id: string;
  title: string;
  level: string;
  lesson_count: number;
  unlocked: boolean;
};

function getClient() {
  return createAdminClient();
}

export async function fetchAllProfilesAdmin(): Promise<AdminProfileRow[] | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, firebase_uid, email, full_name, phone, avatar_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin fetch profiles:", error.message);
    return null;
  }

  return (data ?? []) as AdminProfileRow[];
}

export async function fetchProfileByIdAdmin(
  profileId: string,
): Promise<AdminProfileRow | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, firebase_uid, email, full_name, phone, avatar_url, created_at")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AdminProfileRow;
}

export async function fetchUserAccessAdmin(
  profileId: string,
): Promise<UserCourseAccessRow[] | null> {
  const supabase = getClient();
  if (!supabase) {
    return null;
  }

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, title, level, lesson_count")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (coursesError) {
    console.error("admin fetch courses for access:", coursesError.message);
    return null;
  }

  const unlocked = await getUnlockedCourseIdsForProfile(profileId);

  return (courses ?? []).map((row) => ({
    course_id: row.id as string,
    title: row.title as string,
    level: row.level as string,
    lesson_count: row.lesson_count as number,
    unlocked: unlocked.has(row.id as string),
  }));
}
