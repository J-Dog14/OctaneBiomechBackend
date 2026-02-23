import { prisma } from "@/lib/db/prisma";
import { notFound } from "@/lib/responses";
import { decimalToNumber, deriveLevelFromAthlete } from "@/lib/octane/utils";

type Orientation = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
type ValueUnit = "DEGREES" | "DEGREES_PER_SECOND" | "NUMBER";

export type HittingPayloadMetric = {
  category: string;
  name: string;
  value: number | null;
  valueUnit: ValueUnit | string;
  orientation: Orientation | string | null;
};

export type HittingPayload = {
  athleteUuid: string;
  level: string;
  score: number | null;
  metrics: HittingPayloadMetric[];
  sessionDate?: string | null;
};

const HITTING_METRIC_NAMES = [
  "PROCESSED.Max_Pelvis_Ang_Vel_MEAN",
  "PROCESSED.Max_Thorax_Ang_Vel_MEAN",
  "PROCESSED.Max_Lead_Forearm_Ang_Vel_MEAN",
  "PROCESSED.Max_Bat_Ang_Vel_MEAN",
  "PROCESSED.Pelvis_Shoulders_Separation@Downswing_MEAN",
  "PROCESSED.Trunk_Angle@Lead_Foot_Down_MEAN",
  "PLANE.Bat_Angle_Frontal@Contact",
  "PLANE.Bat_Angle_Sagittal@Contact",
] as const;

const HITTING_METRIC_SPECS: Array<{
  category: string;
  name: string;
  valueUnit: ValueUnit;
  orientation: Orientation;
  metricName: (typeof HITTING_METRIC_NAMES)[number];
}> = [
  {
    category: "PROCESSED",
    name: "Max_Pelvis_Ang_Vel_MEAN",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PROCESSED.Max_Pelvis_Ang_Vel_MEAN",
  },
  {
    category: "PROCESSED",
    name: "Max_Thorax_Ang_Vel_MEAN",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PROCESSED.Max_Thorax_Ang_Vel_MEAN",
  },
  {
    category: "PROCESSED",
    name: "Max_Lead_Forearm_Ang_Vel_MEAN",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PROCESSED.Max_Lead_Forearm_Ang_Vel_MEAN",
  },
  {
    category: "PROCESSED",
    name: "Max_Bat_Ang_Vel_MEAN",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PROCESSED.Max_Bat_Ang_Vel_MEAN",
  },
  {
    category: "PROCESSED",
    name: "Pelvis_Shoulders_Separation@Downswing_MEAN",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PROCESSED.Pelvis_Shoulders_Separation@Downswing_MEAN",
  },
  {
    category: "PROCESSED",
    name: "Trunk_Angle@Lead_Foot_Down_MEAN",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PROCESSED.Trunk_Angle@Lead_Foot_Down_MEAN",
  },
  {
    category: "PLANE",
    name: "Bat_Angle_Frontal@Contact",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PLANE.Bat_Angle_Frontal@Contact",
  },
  {
    category: "PLANE",
    name: "Bat_Angle_Sagittal@Contact",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricName: "PLANE.Bat_Angle_Sagittal@Contact",
  },
];

export async function buildHittingPayload(athleteUuid: string): Promise<HittingPayload> {
  const athlete = await prisma.d_athletes.findUnique({
    where: { athlete_uuid: athleteUuid },
    select: { athlete_uuid: true, age_group: true },
  });

  if (!athlete) {
    throw notFound("Athlete not found");
  }

  const mostRecentSession = await prisma.f_kinematics_hitting.findFirst({
    where: { athlete_uuid: athleteUuid },
    orderBy: { session_date: "desc" },
    select: { session_date: true },
  });

  if (!mostRecentSession) {
    throw notFound("No hitting data found for athlete");
  }

  const rows = await prisma.f_kinematics_hitting.findMany({
    where: {
      athlete_uuid: athleteUuid,
      session_date: mostRecentSession.session_date,
      metric_name: { in: [...HITTING_METRIC_NAMES] },
    },
    select: { metric_name: true, value: true },
  });

  const valueByMetricName = new Map<string, number | null>();
  for (const row of rows) {
    if (!valueByMetricName.has(row.metric_name)) {
      valueByMetricName.set(row.metric_name, decimalToNumber(row.value));
    }
  }

  const metrics: HittingPayloadMetric[] = HITTING_METRIC_SPECS.map((spec) => ({
    category: spec.category,
    name: spec.name,
    value: valueByMetricName.get(spec.metricName) ?? null,
    valueUnit: spec.valueUnit,
    orientation: spec.orientation,
  }));

  const sessionDate = mostRecentSession.session_date.toISOString().split("T")[0];
  return {
    athleteUuid: athlete.athlete_uuid,
    level: deriveLevelFromAthlete({ age_group: athlete.age_group ?? null }),
    score: null,
    metrics,
    sessionDate,
  };
}
