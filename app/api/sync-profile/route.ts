import { NextResponse } from "next/server";

import { verifyFirebaseIdToken } from "@/lib/verify-firebase-token";
import { createAdminClient } from "@/lib/supabase-admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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

  let body: { idToken?: string };
  try {
    body = await request.json();``
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: corsHeaders },
    );
  }

  const idToken = body.idToken;
  if (!idToken) {
    return NextResponse.json(
      { error: "idToken is required." },
      { status: 400, headers: corsHeaders },
    );
  }

  const firebaseUser = await verifyFirebaseIdToken(idToken);
  if (!firebaseUser) {
    return NextResponse.json(
      { error: "Invalid or expired Firebase token." },
      { status: 401, headers: corsHeaders },
    );
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("profiles").upsert(
    {
      firebase_uid: firebaseUser.firebase_uid,
      email: firebaseUser.email,
      full_name: firebaseUser.full_name,
      avatar_url: firebaseUser.avatar_url,
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
