import { prisma } from "@/lib/db/prisma";
import { notFound } from "@/lib/responses";

type Orientation = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
type ValueUnit =
  | "NUMBER"
  | "MPH"
  | "DEGREES"
  | "DEGREES_PER_SECOND"
  | "N_BW"
  | "LBS";

export type PitchingPayloadMetric = {
  category: string;
  name: string;
  value: number | null;
  valueUnit: ValueUnit | string;
  orientation: Orientation | string | null;
};

export type PitchingPayload = {
  athleteUuid: string;
  level: string;
  score: number | null;
  metrics: PitchingPayloadMetric[];
};

type MetricSpec = {
  category: string;
  name: string;
  valueUnit: ValueUnit;
  orientation: Orientation | null;
  /** Metric names in `f_kinematics_pitching.metric_name` to try in order. */
  metricNameCandidates?: string[];
  /** If set, compute value from athlete record instead of kinematics table. */
  fromAthlete?: "weightLbs";
  /** If set, compute value from other computed values. */
  compute?: (ctx: { velocityMph: number | null; weightLbs: number | null }) => number | null;
};

// This is the legacy payload shape you shared in output_payload.json.
// We'll pull values from `f_kinematics_pitching` where possible.
const PITCHING_METRIC_SPECS: MetricSpec[] = [
  {
    category: "SUBJECT_METRICS",
    name: "SCORE",
    valueUnit: "NUMBER",
    orientation: "HIGHER_IS_BETTER",
    // Placeholder scoring: if we don't have a native score metric in the DB,
    // scale velocity into a similar range.
    compute: ({ velocityMph }) =>
      typeof velocityMph === "number" ? velocityMph * 3.125 : null,
  },
  {
    category: "TRACKMAN_METRICS",
    name: "VELOCITY",
    valueUnit: "MPH",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["BALLSPEED.BALL_RELEASE_SPEED"],
  },
  {
    category: "PELVIS_ROTATION",
    name: "FOOT_PLANT",
    valueUnit: "DEGREES",
    orientation: "LOWER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Pelvis_Angle@Footstrike"],
  },
  {
    category: "PELVIS_ROTATION",
    name: "MAX_ER",
    valueUnit: "DEGREES",
    orientation: "LOWER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Pelvis_Angle@Max_Shoulder_Rot"],
  },
  {
    category: "PELVIS_ROTATION",
    name: "RELEASE",
    valueUnit: "DEGREES",
    orientation: "LOWER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Pelvis_Angle@Release"],
  },
  {
    category: "TRUNK_POSITION",
    name: "FOOT_PLANT",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Trunk_Angle@Footstrike"],
  },
  {
    category: "TRUNK_POSITION",
    name: "MAX_ER",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Trunk_Angle@Max_Shoulder_Rot"],
  },
  {
    category: "TRUNK_POSITION",
    name: "RELEASE",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Trunk_Angle@Release"],
  },
  {
    category: "HIP_SHOULDER_SEPARATION",
    name: "FOOT_PLANT",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Hip Shoulders Sep@Footstrike"],
  },
  {
    category: "HIP_SHOULDER_SEPARATION",
    name: "MAX_ER",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Hip Shoulders Sep@Max_Shoulder_Rot"],
  },
  {
    category: "HIP_SHOULDER_SEPARATION",
    name: "RELEASE",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Hip Shoulders Sep@Release"],
  },
  {
    category: "FRONT_LEG",
    name: "FOOT_PLANT",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Lead_Knee_Angle@Footstrike"],
  },
  {
    category: "FRONT_LEG",
    name: "MAX_ER",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Lead_Knee_Angle@Max_Shoulder_Rot"],
  },
  {
    category: "FRONT_LEG",
    name: "RELEASE",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Lead_Knee_Angle@Release"],
  },
  {
    category: "SHOULDER_ER",
    name: "FOOT_PLANT",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Pitching_Shoulder_Angle@Footstrike"],
  },
  {
    category: "SHOULDER_ER",
    name: "MAX",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Pitching_Shoulder_Angle_Max"],
  },
  {
    category: "ABDUCTION",
    name: "FOOT_PLANT",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    // Best-effort mapping; refine once we confirm the intended UAIS metric name.
    metricNameCandidates: ["PROCESSED.Pitching_Shoulder_Angle@Footstrike"],
  },
  {
    category: "ABDUCTION",
    name: "MAX",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Pitching_Shoulder_Angle_Max"],
  },
  {
    category: "KINEMATIC_SEQUENCE",
    name: "PELVIS",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["KINEMATIC_SEQUENCE.Pelvis_Ang_Vel_max"],
  },
  {
    category: "KINEMATIC_SEQUENCE",
    name: "TORSO",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["KINEMATIC_SEQUENCE.Thorax_Ang_Vel_max"],
  },
  {
    category: "KINEMATIC_SEQUENCE",
    name: "ARM",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["KINEMATIC_SEQUENCE.Pitching_Humerus_Ang_Vel_max"],
  },
  {
    category: "KINEMATIC_SEQUENCE",
    name: "HAND",
    valueUnit: "DEGREES_PER_SECOND",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["KINEMATIC_SEQUENCE.Pitching_Hand_Ang_Vel_max"],
  },
  {
    category: "LATERAL_TILT",
    name: "TRANSLATION",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: [],
  },
  {
    category: "FRONT_LEG",
    name: "EXTENSION",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Lead_Knee_Angle_max"],
  },
  {
    category: "FRONT_LEG",
    name: "TRANSLATION",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: [],
  },
  {
    category: "GRF",
    name: "MID_POINT",
    valueUnit: "N_BW",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.Lead_Leg_GRF_mag_Midpoint_FS_Release"],
  },
  { category: "GRF", name: "X_DIR", valueUnit: "N_BW", orientation: "HIGHER_IS_BETTER", metricNameCandidates: [] },
  { category: "GRF", name: "Y_DIR", valueUnit: "N_BW", orientation: "HIGHER_IS_BETTER", metricNameCandidates: [] },
  { category: "GRF", name: "Z_DIR", valueUnit: "N_BW", orientation: "HIGHER_IS_BETTER", metricNameCandidates: [] },
  {
    category: "LATERAL_TILT",
    name: "RELEASE",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: [],
  },
  {
    category: "LINEAR_VELOCITY",
    name: "MAX",
    valueUnit: "MPH",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: ["PROCESSED.MaxPelvisLinearVel_MPH"],
  },
  {
    category: "SUBJECT_METRICS",
    name: "RELEASE",
    valueUnit: "DEGREES",
    orientation: "HIGHER_IS_BETTER",
    metricNameCandidates: [],
  },
  {
    category: "SUBJECT_METRICS",
    name: "WEIGHT",
    valueUnit: "LBS",
    orientation: "HIGHER_IS_BETTER",
    fromAthlete: "weightLbs",
  },
];

function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  // Prisma Decimal supports toString()
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
  // Decimal.js-like
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyVal = value as any;
  if (typeof anyVal.toNumber === "function") return anyVal.toNumber();
  if (typeof anyVal.toString === "function") {
    const num = Number(anyVal.toString());
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function deriveLevelFromAthlete(athlete: { age_group: string | null }): string {
  const raw = athlete.age_group?.trim();
  if (!raw) return "PRO";
  // Keep as-is if it already matches the enum-ish style used in your payloads.
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  return upper;
}

/**
 * Builds a legacy-style pitching payload for a single athlete, choosing the
 * "best" session by max ball release speed when available.
 */
export async function buildPitchingPayload(
  athleteUuid: string
): Promise<PitchingPayload> {
  const athlete = await prisma.d_athletes.findUnique({
    where: { athlete_uuid: athleteUuid },
    select: { athlete_uuid: true, age_group: true, weight: true },
  });

  if (!athlete) {
    throw notFound("Athlete not found");
  }

  // Pick the "best" session: max velocity if present, else most recent session.
  const bestByVelocity = await prisma.f_kinematics_pitching.findFirst({
    where: { athlete_uuid: athleteUuid, metric_name: "BALLSPEED.BALL_RELEASE_SPEED" },
    orderBy: [{ value: "desc" }, { session_date: "desc" }],
    select: { session_date: true, value: true },
  });

  const bestSessionDate =
    bestByVelocity?.session_date ??
    (
      await prisma.f_kinematics_pitching.findFirst({
        where: { athlete_uuid: athleteUuid },
        orderBy: { session_date: "desc" },
        select: { session_date: true },
      })
    )?.session_date;

  if (!bestSessionDate) {
    throw notFound("No pitching data found for athlete");
  }

  const candidateMetricNames = Array.from(
    new Set(
      PITCHING_METRIC_SPECS.flatMap((s) => s.metricNameCandidates ?? []).filter(
        Boolean
      )
    )
  );

  const rows = await prisma.f_kinematics_pitching.findMany({
    where: {
      athlete_uuid: athleteUuid,
      session_date: bestSessionDate,
      ...(candidateMetricNames.length > 0
        ? { metric_name: { in: candidateMetricNames } }
        : {}),
    },
    select: { metric_name: true, value: true },
  });

  const valueByMetricName = new Map<string, number | null>();
  for (const r of rows) {
    if (!valueByMetricName.has(r.metric_name)) {
      valueByMetricName.set(r.metric_name, decimalToNumber(r.value));
    }
  }

  const velocityMph =
    valueByMetricName.get("BALLSPEED.BALL_RELEASE_SPEED") ?? null;
  const weightLbs = decimalToNumber(athlete.weight);

  const metrics: PitchingPayloadMetric[] = PITCHING_METRIC_SPECS.map((spec) => {
    let value: number | null = null;

    if (spec.fromAthlete === "weightLbs") {
      value = weightLbs;
    } else if (spec.compute) {
      value = spec.compute({ velocityMph, weightLbs });
    } else if (spec.metricNameCandidates?.length) {
      for (const candidate of spec.metricNameCandidates) {
        const v = valueByMetricName.get(candidate);
        if (v !== undefined) {
          value = v;
          break;
        }
      }
    }

    return {
      category: spec.category,
      name: spec.name,
      value,
      valueUnit: spec.valueUnit,
      orientation: spec.orientation,
    };
  });

  const scoreMetric = metrics.find(
    (m) => m.category === "SUBJECT_METRICS" && m.name === "SCORE"
  );

  return {
    athleteUuid: athlete.athlete_uuid,
    level: deriveLevelFromAthlete({ age_group: athlete.age_group ?? null }),
    score: scoreMetric?.value ?? null,
    metrics,
  };
}

