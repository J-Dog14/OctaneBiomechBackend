import { NextRequest } from "next/server";
import { success, internalError } from "@/lib/responses";
import { requireApiKey } from "@/lib/auth/requireApiKey";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);

    // Lightweight DB connectivity check
    await prisma.$queryRaw`SELECT 1`;

    return success({ dbOk: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error in GET /api/health:", error);
    return internalError("Failed to check health");
  }
}

