import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import { badRequest, internalError, success } from "@/lib/responses";
import { octanePitchingPayloadQuerySchema } from "@/lib/validation/octane";
import { buildPitchingPayload } from "@/lib/octane/pitchingPayload";

/**
 * Generates a legacy-style pitching JSON payload (like output_payload.json),
 * intended to be sent to Octane later.
 *
 * GET /api/octane/pitching-payload?athleteUuid=<uuid>
 */
export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      athleteUuid: searchParams.get("athleteUuid") ?? undefined,
    };

    const queryValidation = octanePitchingPayloadQuerySchema.safeParse(rawQuery);
    if (!queryValidation.success) {
      return badRequest(
        queryValidation.error.issues.map((e) => e.message).join(", ")
      );
    }

    const payload = await buildPitchingPayload(queryValidation.data.athleteUuid);
    return success(payload);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error in GET /api/octane/pitching-payload:", error);
    return internalError("Failed to generate pitching payload");
  }
}

