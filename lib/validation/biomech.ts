import { z } from "zod";

export const sessionsQuerySchema = z.object({
  orgId: z.string().min(1, "orgId is required"),
  athleteId: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 50;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return 50;
      return Math.min(num, 200);
    }),
  cursor: z.string().optional(),
});

export const sessionDetailQuerySchema = z.object({
  orgId: z.string().min(1, "orgId is required"),
});

export const sessionParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

export type SessionsQuery = z.infer<typeof sessionsQuerySchema>;
export type SessionDetailQuery = z.infer<typeof sessionDetailQuerySchema>;
export type SessionParams = z.infer<typeof sessionParamsSchema>;

