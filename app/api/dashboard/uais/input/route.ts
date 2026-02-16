import { NextRequest } from "next/server";
import { badRequest, notFound, success } from "@/lib/responses";
import { writeInput } from "@/lib/uais/runJob";

/**
 * POST /api/dashboard/uais/input
 * Body: { jobId: string, input: string }
 * Sends input to the running process's stdin (e.g. for conflict prompts).
 */
export async function POST(request: NextRequest) {
  try {
    let body: { jobId?: string; input?: string };
    try {
      body = await request.json();
    } catch {
      return badRequest("JSON body required");
    }
    const { jobId, input } = body;
    if (!jobId || typeof jobId !== "string") {
      return badRequest("jobId is required");
    }
    if (typeof input !== "string") {
      return badRequest("input is required");
    }
    const ok = writeInput(jobId, input.endsWith("\n") ? input : input + "\n");
    if (!ok) {
      return notFound("Job not found or process finished");
    }
    return success({ ok: true });
  } catch {
    return badRequest("Invalid request");
  }
}
