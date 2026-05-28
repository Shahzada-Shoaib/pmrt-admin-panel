type FirebaseLookupUser = {
  localId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
};

export type VerifiedFirebaseUser = {
  firebase_uid: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<VerifiedFirebaseUser | null> {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { users?: FirebaseLookupUser[] };
  const user = data.users?.[0];
  if (!user?.localId) {
    return null;
  }

  return {
    firebase_uid: user.localId,
    email: user.email ?? null,
    full_name: user.displayName ?? null,
    avatar_url: user.photoUrl ?? null,
  };
}
