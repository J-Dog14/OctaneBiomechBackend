/**
 * One-off script to compare pitching payloads from f_pitching_trials vs f_kinematics_pitching.
 * Run: npx tsx scripts/compare-pitching.ts <athleteUuid>
 */
import { comparePitchingPayloads } from "../lib/octane/pitchingPayload";

const athleteUuid = process.argv[2] ?? "3d4888ea-ca48-4149-b97c-a54c35669831";

async function main() {
  console.log("Comparing pitching payloads for athlete:", athleteUuid);
  console.log("");

  const result = await comparePitchingPayloads(athleteUuid);

  if (result.trialsError) {
    console.log("Trials payload error:", result.trialsError);
  } else {
    console.log("From f_pitching_trials: score =", result.fromTrials?.score);
  }

  if (result.kinematicsError) {
    console.log("Kinematics payload error:", result.kinematicsError);
  } else {
    console.log("From f_kinematics_pitching: score =", result.fromKinematics?.score);
  }

  console.log("");
  console.log("Metric comparison (match = same value):");
  console.log("");

  const diffs = result.metricDiffs;
  const mismatches = diffs.filter((d) => !d.match);
  const matches = diffs.filter((d) => d.match);

  if (mismatches.length > 0) {
    console.log("--- MISMATCHES ---");
    for (const d of mismatches) {
      console.log(
        `  ${d.category} / ${d.name} (${d.valueUnit}): trials=${d.valueTrials} kinematics=${d.valueKinematics}`
      );
    }
    console.log("");
  }

  console.log(`Match: ${matches.length} metrics identical (or both null)`);
  console.log(`Mismatch: ${mismatches.length} metrics differ`);

  // Full JSON for inspection
  console.log("");
  console.log("Full comparison JSON:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
