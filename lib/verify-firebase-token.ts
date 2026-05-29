/** Course access: mobile sends uid after Google sign-in (same as sync-profile). */
export function getFirebaseUidFromRequest(request: Request): string | null {
  const uid = request.headers.get("X-Firebase-Uid")?.trim();
  return uid || null;
}
