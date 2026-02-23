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

/**
 * Look up a user in the Octane app by email.
 * Returns a result object so callers can map to HTTP status (401, 400, 404, 503, 502/500).
 */
export async function lookupOctaneUserByEmail(
  email: string
): Promise<OctaneUserLookupResult> {
  const baseUrl = process.env.OCTANE_APP_API_URL?.trim();
  const apiKey = process.env.OCTANE_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      status: 503,
      error: "Octane integration not configured (OCTANE_APP_API_URL or OCTANE_API_KEY missing)",
    };
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/external/users/by-email?email=${encodeURIComponent(email)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({})) as { error?: string };

    if (res.ok) {
      if (!isOctaneUser(body)) {
        return {
          ok: false,
          status: 502,
          error: "Invalid response from Octane API",
        };
      }
      return { ok: true, user: body };
    }

    const errorMessage = typeof body.error === "string" ? body.error : "Request failed";

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
    return {
      ok: false,
      status: 502,
      error: message,
    };
  }
}
