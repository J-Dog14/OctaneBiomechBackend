import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import { badRequest, internalError, success } from "@/lib/responses";
import { octanePitchingPayloadQuerySchema } from "@/lib/validation/octane";
import { comparePitchingPayloads } from "@/lib/octane/pitchingPayload";

/**
 * Compares pitching payloads built from f_pitching_trials vs f_kinematics_pitching
 * for the same athlete. Use this to verify the same numbers are pulled for each variable.
 *
 * GET /api/octane/pitching-payload/compare?athleteUuid=<uuid>
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

    const comparison = await comparePitchingPayloads(
      queryValidation.data.athleteUuid
    );
    return success(comparison);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(
      "Error in GET /api/octane/pitching-payload/compare:",
      error
    );
    return internalError("Failed to compare pitching payloads");
  }
}
