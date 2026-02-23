import { NextRequest } from "next/server";
import { badRequest, internalError, success } from "@/lib/responses";
import { buildAthleteTrackingReport } from "@/lib/athlete-tracking/report";
import { z } from "zod";

const querySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

/**
 * Dashboard-only: athlete tracking report with percentiles per domain.
 * GET /api/dashboard/athlete-tracking/report?athleteUuid=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = { athleteUuid: searchParams.get("athleteUuid") ?? undefined };
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((e) => e.message).join(", ")
      );
    }
    const report = await buildAthleteTrackingReport(parsed.data.athleteUuid);
    return success(report);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error in GET /api/dashboard/athlete-tracking/report:", error);
    return internalError("Failed to generate athlete tracking report");
  }
}
