import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import {
  sessionDetailQuerySchema,
  sessionParamsSchema,
} from "@/lib/validation/biomech";
import { badRequest, internalError, notFound, success } from "@/lib/responses";
import { getSessionById } from "@/lib/biomech/repo";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    requireApiKey(request);

    const { sessionId } = await context.params;

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      orgId: searchParams.get("orgId") ?? undefined,
    };

    const queryValidation = sessionDetailQuerySchema.safeParse(rawQuery);
    if (!queryValidation.success) {
      return badRequest(
        queryValidation.error.issues.map((e) => e.message).join(", ")
      );
    }

    const paramsValidation = sessionParamsSchema.safeParse({ sessionId });
    if (!paramsValidation.success) {
      return badRequest(
        paramsValidation.error.issues.map((e) => e.message).join(", ")
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
