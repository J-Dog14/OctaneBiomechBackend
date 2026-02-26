import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { badRequest, notFound, success, unauthorized } from "@/lib/responses";

/**
 * GET /api/external/users/by-email?email=...
 * Octane contract: returns { uuid, name, email, emailVerified, image } for user lookup.
 * Auth: Authorization: Bearer <OCTANE_API_KEY> (same key as server-side OCTANE_API_KEY).
 * When OCTANE_APP_API_URL points at this app (e.g. localhost), this route satisfies the contract.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.OCTANE_API_KEY?.trim();
  const isDev = process.env.NODE_ENV === "development";

  if (!expectedKey && !isDev) {
    return NextResponse.json(
      { error: "Octane API key not configured" },
      { status: 503 }
    );
  }

  if (expectedKey) {
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";
    if (token !== expectedKey) {
      return unauthorized("Invalid or missing API key");
    }
  }

  const emailParam = request.nextUrl.searchParams.get("email");
  if (emailParam === null || emailParam === "") {
    return badRequest("Email query parameter is required");
  }
  const email = emailParam.trim();
  if (!email || !email.includes("@")) {
    return badRequest("Invalid email format");
  }

  const athlete = await prisma.d_athletes.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: {
      athlete_uuid: true,
      name: true,
      email: true,
    },
  });

  if (!athlete || athlete.email === null) {
    return notFound("User not found");
  }

  return success({
    uuid: athlete.athlete_uuid,
    name: athlete.name,
    email: athlete.email,
    emailVerified: true,
    image: null,
  });
}
