/**
 * Octane app user lookup by email.
 * Calls GET /api/external/users/by-email with Bearer token.
 * All requests must be made from the server; never expose OCTANE_API_KEY to the client.
 */

export type OctaneUser = {
  uuid: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
};

export type OctaneUserLookupSuccess = { ok: true; user: OctaneUser };

export type OctaneUserLookupError = {
  ok: false;
  status: 400 | 401 | 404 | 500 | 502 | 503;
  error: string;
};

export type OctaneUserLookupResult = OctaneUserLookupSuccess | OctaneUserLookupError;

function isOctaneUser(data: unknown): data is OctaneUser {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.uuid === "string" &&
    typeof o.email === "string" &&
    typeof o.emailVerified === "boolean" &&
    (o.name === null || typeof o.name === "string") &&
    (o.image === null || typeof o.image === "string")
  );
}

/** True when base URL is localhost (for dev: optional API key). */
function isLocalhostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Look up a user in the Octane app by email.
 * Returns a result object so callers can map to HTTP status (401, 400, 404, 503, 502/500).
 * In development, when OCTANE_APP_API_URL is localhost, OCTANE_API_KEY is optional (no auth sent).
 */
export async function lookupOctaneUserByEmail(
  email: string
): Promise<OctaneUserLookupResult> {
  const baseUrl = process.env.OCTANE_APP_API_URL?.trim();
  const apiKey = process.env.OCTANE_API_KEY?.trim();
  const isLocal = baseUrl ? isLocalhostUrl(baseUrl) : false;
  const allowNoKey = process.env.NODE_ENV === "development" && isLocal;

  if (!baseUrl) {
    return {
      ok: false,
      status: 503,
      error: "Octane integration not configured (OCTANE_APP_API_URL or OCTANE_API_KEY missing)",
    };
  }
  if (!allowNoKey && !apiKey) {
    return {
      ok: false,
      status: 503,
      error: "Octane integration not configured (OCTANE_APP_API_URL or OCTANE_API_KEY missing)",
    };
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/external/users/by-email?email=${encodeURIComponent(email)}`;
  const headers: Record<string, string> = {};
  if (apiKey) {
    // Use key as-is; avoid double-encoding (e.g. .env should have literal "=" not "%3D")
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({})) as { error?: string };

    if (res.ok) {
      if (!isOctaneUser(body)) {
        return {
          ok: false,
          status: 502,
          error:
            "Invalid response from Octane API. Expected JSON with uuid, name, email, emailVerified, image. Check that the Octane app exposes GET /api/external/users/by-email.",
        };
      }
      return { ok: true, user: body };
    }

    let errorMessage = typeof body.error === "string" ? body.error : "Request failed";
    if (res.status === 401 && process.env.NODE_ENV === "development") {
      const sentLength = apiKey ? apiKey.length : 0;
      errorMessage += ` [Dev: we sent Authorization header with length ${sentLength}. If 0, OCTANE_API_KEY is empty or not loaded. If >0, Octane may require a server API key, not a session token.]`;
    }

    if (res.status === 401) {
      return { ok: false, status: 401, error: errorMessage };
    }
    if (res.status === 400) {
      return { ok: false, status: 400, error: errorMessage };
    }
    if (res.status === 404) {
      return { ok: false, status: 404, error: errorMessage };
    }

    return {
      ok: false,
      status: res.status >= 500 ? 502 : 500,
      error: errorMessage,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    const hint =
      baseUrl && isLocalhostUrl(baseUrl)
        ? " Is the Octane app running on that port?"
        : "";
    return {
      ok: false,
      status: 502,
      error: `Could not reach Octane app.${hint} Details: ${message}`,
    };
  }
}
