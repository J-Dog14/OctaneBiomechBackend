/**
 * Resolves Octane app user/athlete UUID by email from the Octane app db.
 * When a match is found, we set app_db_uuid and app_db_synced_at on d_athletes.
 *
 * Implementation options:
 * - External API: set OCTANE_APP_API_URL and call GET/POST that returns { appUuid } for a given email.
 * - Same DB: query another schema/table if the app db lives in the same PostgreSQL.
 *
 * Current: stub that returns null (no integration). Set up the env and client when the app API is available.
 */
export async function resolveAppUuidByEmail(normalizedEmail: string): Promise<string | null> {
  const baseUrl = process.env.OCTANE_APP_API_URL?.trim();
  if (!baseUrl) {
    return null;
  }
  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/users/by-email?email=${encodeURIComponent(normalizedEmail)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { appUuid?: string; id?: string };
    return data.appUuid ?? data.id ?? null;
  } catch {
    return null;
  }
}
