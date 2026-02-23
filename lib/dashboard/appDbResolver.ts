import { lookupOctaneUserByEmail } from "@/lib/octane/octaneUserLookup";

/**
 * Resolves Octane app user/athlete UUID by email from the Octane app API.
 * When a match is found, we set app_db_uuid and app_db_synced_at on d_athletes.
 *
 * Uses GET /api/external/users/by-email with Bearer token (OCTANE_APP_API_URL, OCTANE_API_KEY).
 */
export async function resolveAppUuidByEmail(normalizedEmail: string): Promise<string | null> {
  const result = await lookupOctaneUserByEmail(normalizedEmail);
  if (result.ok) {
    return result.user.uuid;
  }
  return null;
}
