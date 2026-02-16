import { NextResponse } from "next/server";
import { getUaisRunners } from "@/lib/uais/runners";

/**
 * GET /api/dashboard/uais/runners
 * Returns list of UAIS runners that have CWD configured in env.
 */
export async function GET() {
  const runners = getUaisRunners();
  return NextResponse.json({ runners });
}
