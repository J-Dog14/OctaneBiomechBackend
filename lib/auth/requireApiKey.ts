import { NextRequest } from "next/server";
import { unauthorized } from "@/lib/responses";

/**
 * Validates the X-API-Key header against allowed keys from env.
 * Uses constant-time comparison to avoid timing attacks.
 */
export function requireApiKey(request: NextRequest): void {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    throw unauthorized("Missing X-API-Key header");
  }

  const allowedKeys = getAllowedKeys();

  if (allowedKeys.length === 0) {
    throw new Error("BIOMECH_API_KEYS not configured");
  }

  const isValid = constantTimeCompare(apiKey, allowedKeys);

  if (!isValid) {
    throw unauthorized("Invalid API key");
  }
}

/**
 * Gets allowed API keys from env var (comma-separated).
 */
function getAllowedKeys(): string[] {
  const keysEnv = process.env.BIOMECH_API_KEYS;
  if (!keysEnv) {
    return [];
  }
  return keysEnv.split(",").map((k) => k.trim()).filter(Boolean);
}

/**
 * Constant-time comparison to prevent timing attacks.
 * Compares the provided key against all allowed keys.
 */
function constantTimeCompare(provided: string, allowed: string[]): boolean {
  let match = false;
  for (const allowedKey of allowed) {
    if (provided.length !== allowedKey.length) {
      continue;
    }

    let diff = 0;
    for (let i = 0; i < provided.length; i++) {
      diff |= provided.charCodeAt(i) ^ allowedKey.charCodeAt(i);
    }

    if (diff === 0) {
      match = true;
    }
  }

  return match;
}

