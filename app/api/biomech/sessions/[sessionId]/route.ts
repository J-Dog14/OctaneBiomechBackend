import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import {
  sessionDetailQuerySchema,
  sessionParamsSchema,
} from "@/lib/validation/biomech";
import { badRequest, internalError, notFound, success } from "@/lib/responses";
import { getSessionById } from "@/lib/biomech/repo";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    requireApiKey(request);

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      orgId: searchParams.get("orgId") ?? undefined,
    };

    const queryValidation = sessionDetailQuerySchema.safeParse(rawQuery);
    if (!queryValidation.success) {
      return badRequest(
        queryValidation.error.errors.map((e) => e.message).join(", ")
      );
    }

    const paramsValidation = sessionParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return badRequest(
        paramsValidation.error.errors.map((e) => e.message).join(", ")
      );
    }

    const session = await getSessionById(
      paramsValidation.data.sessionId,
      queryValidation.data.orgId
    );

    if (!session) {
      return notFound("Session not found");
    }

    return success(session);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error in GET /api/biomech/sessions/[sessionId]:", error);
    return internalError("Failed to fetch session");
  }
}

