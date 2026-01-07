import { NextRequest, NextResponse } from "next/server";
import { success } from "@/lib/responses";

export async function GET(request: NextRequest) {
  return success({ ok: true });
}

