/**
 * TEMPORARY DEBUG ENDPOINT - DELETE AFTER TROUBLESHOOTING!
 * 
 * This endpoint helps verify that environment variables are being read correctly.
 * DO NOT leave this in production - it exposes information about your setup.
 */

import { NextRequest } from "next/server";
import { success } from "@/lib/responses";

export async function GET(request: NextRequest) {
  // Check if environment variable exists
  const hasKeys = !!process.env.BIOMECH_API_KEYS;
  const keyCount = process.env.BIOMECH_API_KEYS
    ? process.env.BIOMECH_API_KEYS.split(",").length
    : 0;
  const firstKeyLength = process.env.BIOMECH_API_KEYS
    ? process.env.BIOMECH_API_KEYS.split(",")[0]?.trim().length ?? 0
    : 0;

  // NEVER log the actual key value for security!
  return success({
    hasBIOMECH_API_KEYS: hasKeys,
    numberOfKeys: keyCount,
    firstKeyLength: firstKeyLength,
    // Show first 3 chars and last 3 chars for verification (safe)
    firstKeyPreview: process.env.BIOMECH_API_KEYS
      ? `${process.env.BIOMECH_API_KEYS.split(",")[0]?.trim().substring(0, 3)}...${process.env.BIOMECH_API_KEYS.split(",")[0]?.trim().slice(-3)}`
      : null,
    note: "Delete this endpoint after troubleshooting!",
  });
}
