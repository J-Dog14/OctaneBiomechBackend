import { z } from "zod";

/**
 * Query params for generating a report payload we can later send to Octane.
 * For now, this endpoint only reads from the UAIS/warehouse database.
 */
export const octaneReportPayloadQuerySchema = z.object({
  athleteUuid: z.string().min(1).optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 25;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return 25;
      return Math.min(num, 200);
    }),
});

export type OctaneReportPayloadQuery = z.infer<
  typeof octaneReportPayloadQuerySchema
>;

/**
 * Query params for generating a pitching payload (legacy JSON shape),
 * intended to be sent to Octane later.
 */
export const octanePitchingPayloadQuerySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

export type OctanePitchingPayloadQuery = z.infer<
  typeof octanePitchingPayloadQuerySchema
>;

