import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import { internalError, success } from "@/lib/responses";

/**
 * You do NOT need this route just to have `/api/uais/athletes`.
 * It's only here if you want `/api/uais` to return something helpful.
 */
export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);
    return success({
      ok: true,
      endpoints: ["/api/uais/athletes", "/api/octane/report-payloads"],
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error in GET /api/uais:", error);
    return internalError("Failed to fetch UAIS API index");
  }
}
