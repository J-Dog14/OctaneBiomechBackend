import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import { badRequest, internalError, success } from "@/lib/responses";
import { octaneReportPayloadQuerySchema } from "@/lib/validation/octane";
import { buildAthleteReportPayload } from "@/lib/octane/reportPayload";
import { prisma } from "@/lib/db/prisma";

/**
 * Generates JSON payloads intended to be sent to Octane later.
 *
 * For now this is read-only and does NOT call Octane.
 *
 * GET /api/octane/report-payloads?athleteUuid=<uuid>
 * GET /api/octane/report-payloads?limit=25   (returns first N athletes with payloads)
 */
export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      athleteUuid: searchParams.get("athleteUuid") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const queryValidation = octaneReportPayloadQuerySchema.safeParse(rawQuery);
    if (!queryValidation.success) {
      return badRequest(
        queryValidation.error.issues.map((e) => e.message).join(", ")
      );
    }

    const { athleteUuid, limit } = queryValidation.data;

    if (athleteUuid) {
      const payload = await buildAthleteReportPayload(athleteUuid);
      return success(payload);
    }

    // No athleteUuid provided — return a batch of payloads.
    const athletes = await prisma.d_athletes.findMany({
      take: limit ?? 25,
      orderBy: { created_at: "desc" },
      select: { athlete_uuid: true },
    });

    const payloads = await Promise.all(
      athletes.map((a) => buildAthleteReportPayload(a.athlete_uuid))
    );

    return success({
      generatedAt: new Date().toISOString(),
      count: payloads.length,
      payloads,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error in GET /api/octane/report-payloads:", error);
    return internalError("Failed to generate report payload(s)");
  }
}

