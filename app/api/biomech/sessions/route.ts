import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import { sessionsQuerySchema } from "@/lib/validation/biomech";
import { badRequest, internalError, success } from "@/lib/responses";
import { listSessions } from "@/lib/biomech/repo";

export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);

    const { searchParams } = new URL(request.url);
    const rawParams = {
      orgId: searchParams.get("orgId") ?? undefined,
      athleteId: searchParams.get("athleteId") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    };

    const validationResult = sessionsQuerySchema.safeParse(rawParams);

    if (!validationResult.success) {
      return badRequest(
        validationResult.error.errors.map((e) => e.message).join(", ")
      );
    }

    const params = validationResult.data;
    const result = await listSessions({
      orgId: params.orgId,
      athleteId: params.athleteId,
      limit: params.limit ?? 50,
      cursor: params.cursor,
    });

    return success(result);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error in GET /api/biomech/sessions:", error);
    return internalError("Failed to fetch sessions");
  }
}

