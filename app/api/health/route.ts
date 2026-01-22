import { NextRequest } from "next/server";
import { success, internalError } from "@/lib/responses";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/health
 * 
 * Public health check endpoint (no authentication required).
 * Useful for monitoring and deployment verification.
 */
export async function GET(request: NextRequest) {
  try {
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

