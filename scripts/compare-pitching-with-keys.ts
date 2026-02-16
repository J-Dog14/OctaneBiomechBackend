/**
 * Compare pitching payloads and list metrics JSON keys vs expected (kinematics) metric names.
 * Run: npx tsx scripts/compare-pitching-with-keys.ts <athleteUuid>
 */
import { prisma } from "../lib/db/prisma";
import { comparePitchingPayloads } from "../lib/octane/pitchingPayload";

const athleteUuid = process.argv[2] ?? "635909dc-1f3e-4c26-85fb-4c262868d419";

const EXPECTED_METRIC_KEYS = [
  "BALLSPEED.BALL_RELEASE_SPEED",
  "PROCESSED.Pelvis_Angle@Footstrike",
  "PROCESSED.Pelvis_Angle@Max_Shoulder_Rot",
  "PROCESSED.Pelvis_Angle@Release",
  "PROCESSED.Trunk_Angle@Footstrike",
  "PROCESSED.Trunk_Angle@Max_Shoulder_Rot",
  "PROCESSED.Trunk_Angle@Release",
  "PROCESSED.Hip Shoulders Sep@Footstrike",
  "PROCESSED.Hip Shoulders Sep@Max_Shoulder_Rot",
  "PROCESSED.Hip Shoulders Sep@Release",
  "PROCESSED.Lead_Knee_Angle@Footstrike",
  "PROCESSED.Lead_Knee_Angle@Max_Shoulder_Rot",
  "PROCESSED.Lead_Knee_Angle@Release",
  "PROCESSED.Pitching_Shoulder_Angle@Footstrike",
  "PROCESSED.Pitching_Shoulder_Angle_Max",
  "KINEMATIC_SEQUENCE.Pelvis_Ang_Vel_max",
  "KINEMATIC_SEQUENCE.Thorax_Ang_Vel_max",
  "KINEMATIC_SEQUENCE.Pitching_Humerus_Ang_Vel_max",
  "KINEMATIC_SEQUENCE.Pitching_Hand_Ang_Vel_max",
  "PROCESSED.Lead_Knee_Angle_max",
  "PROCESSED.Lead_Leg_GRF_mag_Midpoint_FS_Release",
  "PROCESSED.MaxPelvisLinearVel_MPH",
];

async function main() {
  console.log("Athlete UUID:", athleteUuid);
  console.log("");

  // 1) Best trial from f_pitching_trials – get metrics JSON keys
  const bestTrial = await prisma.f_pitching_trials.findFirst({
    where: { athlete_uuid: athleteUuid },
    orderBy: [
      { velocity_mph: "desc" },
      { session_date: "desc" },
      { trial_index: "asc" },
    ],
    select: { metrics: true, velocity_mph: true, session_date: true, trial_index: true },
  });

  const jsonKeys: string[] = [];
  if (bestTrial?.metrics && typeof bestTrial.metrics === "object" && !Array.isArray(bestTrial.metrics)) {
    jsonKeys.push(...Object.keys(bestTrial.metrics as Record<string, unknown>));
  }
  jsonKeys.sort();

  console.log("--- f_pitching_trials (best trial) ---");
  if (!bestTrial) {
    console.log("No trial found.");
  } else {
    console.log("session_date:", bestTrial.session_date);
    console.log("trial_index:", bestTrial.trial_index);
    console.log("velocity_mph:", bestTrial.velocity_mph?.toString());
    console.log("metrics JSON keys (" + jsonKeys.length + "):");
    jsonKeys.forEach((k) => console.log("  ", k));
  }
  console.log("");

  // 2) Metric names from f_kinematics_pitching for this athlete (best session by velocity)
  const bestSession = await prisma.f_kinematics_pitching.findFirst({
    where: {
      athlete_uuid: athleteUuid,
      metric_name: "BALLSPEED.BALL_RELEASE_SPEED",
    },
    orderBy: [{ value: "desc" }, { session_date: "desc" }],
    select: { session_date: true },
  });
  const sessionDate = bestSession?.session_date;

  let kinematicsMetricNames: string[] = [];
  if (sessionDate) {
    const rows = await prisma.f_kinematics_pitching.findMany({
      where: {
        athlete_uuid: athleteUuid,
        session_date: sessionDate,
      },
      select: { metric_name: true },
      distinct: ["metric_name"],
    });
    kinematicsMetricNames = rows.map((r) => r.metric_name).sort();
  }

  console.log("--- f_kinematics_pitching (best session by velocity) ---");
  if (!sessionDate) {
    console.log("No kinematics session found.");
  } else {
    console.log("session_date:", sessionDate);
    console.log("metric_name values (" + kinematicsMetricNames.length + "):");
    kinematicsMetricNames.forEach((k) => console.log("  ", k));
  }
  console.log("");

  // 3) Key comparison: expected (payload) vs JSON vs kinematics
  const expectedSet = new Set(EXPECTED_METRIC_KEYS);
  const jsonSet = new Set(jsonKeys);
  const kinSet = new Set(kinematicsMetricNames);

  console.log("--- Key comparison (expected by payload vs JSON vs kinematics) ---");
  console.log("Expected keys (from PITCHING_METRIC_SPECS):", EXPECTED_METRIC_KEYS.length);
  console.log("In trials metrics JSON:", jsonKeys.length);
  console.log("In kinematics (this session):", kinematicsMetricNames.length);
  console.log("");

  const inBothJsonAndExpected = EXPECTED_METRIC_KEYS.filter((k) => jsonSet.has(k));
  const inJsonNotExpected = jsonKeys.filter((k) => !expectedSet.has(k));
  const expectedNotInJson = EXPECTED_METRIC_KEYS.filter((k) => !jsonSet.has(k));
  const inKinematicsNotExpected = kinematicsMetricNames.filter((k) => !expectedSet.has(k));
  const expectedNotInKinematics = EXPECTED_METRIC_KEYS.filter((k) => !kinSet.has(k));

  console.log("Expected keys that ARE in trials JSON:", inBothJsonAndExpected.length);
  inBothJsonAndExpected.forEach((k) => console.log("  ", k));
  console.log("");

  console.log("Expected keys NOT in trials JSON:", expectedNotInJson.length);
  expectedNotInJson.forEach((k) => console.log("  ", k));
  console.log("");

  console.log("Trials JSON keys NOT in expected list (extra keys):", inJsonNotExpected.length);
  inJsonNotExpected.slice(0, 40).forEach((k) => console.log("  ", k));
  if (inJsonNotExpected.length > 40) console.log("  ... and", inJsonNotExpected.length - 40, "more");
  console.log("");

  console.log("Expected keys NOT in kinematics (this session):", expectedNotInKinematics.length);
  expectedNotInKinematics.forEach((k) => console.log("  ", k));
  console.log("");

  // 4) Run payload comparison
  console.log("--- Payload comparison ---");
  const result = await comparePitchingPayloads(athleteUuid);

  if (result.trialsError) console.log("Trials error:", result.trialsError);
  else console.log("From trials: score =", result.fromTrials?.score, "velocity =", result.fromTrials?.metrics?.find((m) => m.name === "VELOCITY")?.value);

  if (result.kinematicsError) console.log("Kinematics error:", result.kinematicsError);
  else console.log("From kinematics: score =", result.fromKinematics?.score, "velocity =", result.fromKinematics?.metrics?.find((m) => m.name === "VELOCITY")?.value);

  const mismatches = result.metricDiffs.filter((d) => !d.match);
  const matches = result.metricDiffs.filter((d) => d.match);
  console.log("Match:", matches.length, "| Mismatch:", mismatches.length);
  if (mismatches.length > 0 && mismatches.length <= 30) {
    mismatches.forEach((d) =>
      console.log("  ", d.category, d.name, "| trials:", d.valueTrials, "| kinematics:", d.valueKinematics)
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
