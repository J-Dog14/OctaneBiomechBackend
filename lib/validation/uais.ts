import { z } from "zod";

export const uaisAthletesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 50;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return 50;
      return Math.min(num, 10000);
    }),
  cursor: z.string().optional(),
  q: z.string().optional(),
  filterNonApp: z
    .string()
    .optional()
    .transform((val) => val === "1" || val?.toLowerCase() === "true"),
});

export type UaisAthletesQuery = z.infer<typeof uaisAthletesQuerySchema>;

export const uaisArmActionQuerySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

export type UaisArmActionQuery = z.infer<typeof uaisArmActionQuerySchema>;

export const uaisAthleticScreenQuerySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

export type UaisAthleticScreenQuery = z.infer<
  typeof uaisAthleticScreenQuerySchema
>;

export const uaisProteusQuerySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

export type UaisProteusQuery = z.infer<typeof uaisProteusQuerySchema>;

export const uaisHittingQuerySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

export type UaisHittingQuery = z.infer<typeof uaisHittingQuerySchema>;

export const uaisMobilityQuerySchema = z.object({
  athleteUuid: z.string().min(1, "athleteUuid is required"),
});

export type UaisMobilityQuery = z.infer<typeof uaisMobilityQuerySchema>;

