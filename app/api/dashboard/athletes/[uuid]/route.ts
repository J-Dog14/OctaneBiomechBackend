import { NextRequest } from "next/server";
import { internalError, notFound, success } from "@/lib/responses";
import { buildAthleteReportPayload } from "@/lib/octane/reportPayload";

/**
 * Dashboard-only: single athlete with full report payload (counts).
 * No API key required.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    if (!uuid) {
      return notFound("Athlete not found");
    }
    const payload = await buildAthleteReportPayload(uuid);
    return success(payload);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error in GET /api/dashboard/athletes/[uuid]:", error);
    return internalError("Failed to fetch athlete");
  }
}
