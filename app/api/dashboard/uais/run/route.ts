import { NextRequest } from "next/server";
import { badRequest, internalError, success } from "@/lib/responses";
import { getUaisRunner } from "@/lib/uais/runners";
import { createJob } from "@/lib/uais/runJob";

/**
 * POST /api/dashboard/uais/run
 * Body: { runnerId: string }
 * Starts the UAIS process for that runner. Returns jobId; client should then
 * fetch GET /api/dashboard/uais/stream?jobId=... to receive output and
 * POST to /api/dashboard/uais/run/input to send stdin.
 */
export async function POST(request: NextRequest) {
  try {
    let body: { runnerId?: string };
    try {
      body = await request.json();
    } catch {
      return badRequest("JSON body required");
    }
    const runnerId = body.runnerId;
    if (!runnerId || typeof runnerId !== "string") {
      return badRequest("runnerId is required");
    }
    const runner = getUaisRunner(runnerId);
    if (!runner) {
      return badRequest("Unknown or unconfigured runner. Set the runner's CWD env var.");
    }
    const jobId = createJob(runner);
    return success({ jobId });
  } catch (error) {
    console.error("Error in POST /api/dashboard/uais/run:", error);
    return internalError("Failed to start UAIS process");
  }
}
