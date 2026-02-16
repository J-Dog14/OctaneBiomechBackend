/**
 * UAIS project runners. Each runs a script (e.g. main.py or main.R) in a project directory.
 * Paths and commands come from env so you don't commit machine-specific paths.
 *
 * Set env vars like:
 *   UAIS_ATHLETIC_SCREEN_CWD=D:\Athletic Screen 2.0
 *   UAIS_ATHLETIC_SCREEN_CMD=python main.py
 *
 * If CWD is not set, the runner is omitted from the list (so the UI only shows configured runners).
 */
export type UaisRunner = {
  id: string;
  label: string;
  cwd: string;
  command: string;
};

const RUNNER_DEFS: { id: string; label: string; cwdEnv: string; cmdEnv: string; defaultCmd: string }[] = [
  { id: "athletic-screen", label: "Athletic Screen", cwdEnv: "UAIS_ATHLETIC_SCREEN_CWD", cmdEnv: "UAIS_ATHLETIC_SCREEN_CMD", defaultCmd: "python main.py" },
  { id: "arm-action", label: "Arm Action", cwdEnv: "UAIS_ARM_ACTION_CWD", cmdEnv: "UAIS_ARM_ACTION_CMD", defaultCmd: "python main.py" },
  { id: "curveball", label: "Curveball", cwdEnv: "UAIS_CURVEBALL_CWD", cmdEnv: "UAIS_CURVEBALL_CMD", defaultCmd: "python main.py" },
  { id: "pitching", label: "Pitching", cwdEnv: "UAIS_PITCHING_CWD", cmdEnv: "UAIS_PITCHING_CMD", defaultCmd: "python main.py" },
  { id: "hitting", label: "Hitting", cwdEnv: "UAIS_HITTING_CWD", cmdEnv: "UAIS_HITTING_CMD", defaultCmd: "python main.py" },
  { id: "pro-sup", label: "Pro Sup", cwdEnv: "UAIS_PRO_SUP_CWD", cmdEnv: "UAIS_PRO_SUP_CMD", defaultCmd: "python main.py" },
  { id: "proteus", label: "Proteus", cwdEnv: "UAIS_PROTEUS_CWD", cmdEnv: "UAIS_PROTEUS_CMD", defaultCmd: "python main.py" },
  { id: "mobility", label: "Mobility", cwdEnv: "UAIS_MOBILITY_CWD", cmdEnv: "UAIS_MOBILITY_CMD", defaultCmd: "python main.py" },
  { id: "readiness-screen", label: "Readiness Screen", cwdEnv: "UAIS_READINESS_SCREEN_CWD", cmdEnv: "UAIS_READINESS_SCREEN_CMD", defaultCmd: "python main.py" },
];

export function getUaisRunners(): UaisRunner[] {
  return RUNNER_DEFS
    .map((d) => {
      const cwd = process.env[d.cwdEnv]?.trim();
      if (!cwd) return null;
      const command = process.env[d.cmdEnv]?.trim() || d.defaultCmd;
      return { id: d.id, label: d.label, cwd, command };
    })
    .filter((r): r is UaisRunner => r !== null);
}

export function getUaisRunner(id: string): UaisRunner | null {
  const runners = getUaisRunners();
  return runners.find((r) => r.id === id) ?? null;
}
