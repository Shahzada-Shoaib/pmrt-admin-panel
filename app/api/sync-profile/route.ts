import { NextResponse } from "next/server";

// import { verifyFirebaseIdToken } from "@/lib/verify-firebase-token";
import { corsHeaders } from "@/lib/api-cors";
import { createAdminClient } from "@/lib/supabase-admin";

type SyncProfileBody = {
  firebase_uid?: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server missing Supabase service role key." },
      { status: 503, headers: corsHeaders },
    );
  }

  let body: SyncProfileBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: corsHeaders },
    );
  }

  const firebaseUid = body.firebase_uid?.trim();
  if (!firebaseUid) {
    return NextResponse.json(
      { error: "firebase_uid is required." },
      { status: 400, headers: corsHeaders },
    );
  }

  // --- Previous idToken + Firebase verify flow (disabled) ---
  // const idToken = body.idToken;
  // if (!idToken) {
  //   return NextResponse.json(
  //     { error: "idToken is required." },
  //     { status: 400, headers: corsHeaders },
  //   );
  // }
  // const firebaseUser = await verifyFirebaseIdToken(idToken);
  // if (!firebaseUser) {
  //   return NextResponse.json(
  //     { error: "Invalid or expired Firebase token." },
  //     { status: 401, headers: corsHeaders },
  //   );
  // }

  const now = new Date().toISOString();
  const { error } = await supabase.from("profiles").upsert(
    {
      firebase_uid: firebaseUid,
      email: body.email ?? null,
      full_name: body.full_name ?? null,
      avatar_url: body.avatar_url ?? null,
      role: "student",
      updated_at: now,
    },
    { onConflict: "firebase_uid" },
  );

  if (error) {
    console.error("profile upsert failed:", error.message);
    return NextResponse.json(
      { error: "Could not save profile." },
      { status: 500, headers: corsHeaders },
    );
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}
