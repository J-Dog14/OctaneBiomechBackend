import { prisma } from "@/lib/db/prisma";
import { notFound } from "@/lib/responses";
import { decimalToNumber, deriveLevelFromAthlete } from "@/lib/octane/utils";

type Orientation = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
type ValueUnit = "NUMBER" | "IN" | "W" | "W_PER_KG" | "S" | "J";

export type AthleticScreenPayloadMetric = {
  category: string;
  name: string;
  value: number | null;
  valueUnit: ValueUnit | string;
  orientation: Orientation | string | null;
};

export type AthleticScreenPayload = {
  athleteUuid: string;
  level: string;
  score: number | null;
  metrics: AthleticScreenPayloadMetric[];
  sessionDate?: string | null;
};

export async function buildAthleticScreenPayload(
  athleteUuid: string
): Promise<AthleticScreenPayload> {
  const athlete = await prisma.d_athletes.findUnique({
    where: { athlete_uuid: athleteUuid },
    select: { athlete_uuid: true, age_group: true },
  });

  if (!athlete) {
    throw notFound("Athlete not found");
  }

  const [latestCmj, latestDj] = await Promise.all([
    prisma.f_athletic_screen_cmj.findFirst({
      where: { athlete_uuid: athleteUuid },
      orderBy: [{ session_date: "desc" }, { created_at: "desc" }],
      select: { session_date: true },
    }),
    prisma.f_athletic_screen_dj.findFirst({
      where: { athlete_uuid: athleteUuid },
      orderBy: [{ session_date: "desc" }, { created_at: "desc" }],
      select: { session_date: true },
    }),
  ]);

  const sessionDate =
    latestCmj?.session_date && latestDj?.session_date
      ? latestCmj.session_date >= latestDj.session_date
        ? latestCmj.session_date
        : latestDj.session_date
      : latestCmj?.session_date ?? latestDj?.session_date;

  if (!sessionDate) {
    throw notFound("No athletic screen data found for athlete");
  }

  const [cmjRow, djRow] = await Promise.all([
    prisma.f_athletic_screen_cmj.findFirst({
      where: { athlete_uuid: athleteUuid, session_date: sessionDate },
      orderBy: { created_at: "desc" },
      select: {
        jh_in: true,
        peak_power: true,
        auc_j: true,
        kurtosis: true,
        rpd_max_w_per_s: true,
        time_to_rpd_max_s: true,
      },
    }),
    prisma.f_athletic_screen_dj.findFirst({
      where: { athlete_uuid: athleteUuid, session_date: sessionDate },
      orderBy: { created_at: "desc" },
      select: {
        jh_in: true,
        peak_power: true,
        auc_j: true,
        kurtosis: true,
        rpd_max_w_per_s: true,
        time_to_rpd_max_s: true,
        rsi: true,
        ct: true,
      },
    }),
  ]);

  const orientation: Orientation = "HIGHER_IS_BETTER";
  const valueUnit: ValueUnit = "NUMBER";
  const metrics: AthleticScreenPayloadMetric[] = [];

  const commonSpecs = [
    { name: "JH", key: "jh_in" as const },
    { name: "PP", key: "peak_power" as const },
    { name: "Work (AUC)", key: "auc_j" as const },
    { name: "Kurtosis", key: "kurtosis" as const },
    { name: "Max RPD", key: "rpd_max_w_per_s" as const },
    { name: "Time to Max RPD", key: "time_to_rpd_max_s" as const },
  ];

  if (cmjRow) {
    for (const { name, key } of commonSpecs) {
      metrics.push({
        category: "CMJ",
        name,
        value: decimalToNumber(cmjRow[key]),
        valueUnit,
        orientation,
      });
    }
  }

  if (djRow) {
    for (const { name, key } of commonSpecs) {
      metrics.push({
        category: "DJ",
        name,
        value: decimalToNumber(djRow[key]),
        valueUnit,
        orientation,
      });
    }
    metrics.push(
      {
        category: "DJ",
        name: "RSI",
        value: decimalToNumber(djRow.rsi),
        valueUnit,
        orientation,
      },
      {
        category: "DJ",
        name: "CT",
        value: decimalToNumber(djRow.ct),
        valueUnit,
        orientation,
      }
    );
  }

  const sessionDateStr = sessionDate.toISOString().split("T")[0];
  return {
    athleteUuid: athlete.athlete_uuid,
    level: deriveLevelFromAthlete({ age_group: athlete.age_group ?? null }),
    score: null,
    metrics,
    sessionDate: sessionDateStr,
  };
}
