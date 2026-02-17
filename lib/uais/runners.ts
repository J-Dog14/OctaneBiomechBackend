import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * UAIS project runners. Each runs a script (e.g. main.py or main.R) in a project directory.
 * Runners can come from:
 * 1. Config file: config/uais-runners.json (or path in UAIS_RUNNERS_CONFIG). Each entry: { id, label, cwd, command }.
 * 2. Env vars: UAIS_ATHLETIC_SCREEN_CWD, UAIS_ATHLETIC_SCREEN_CMD, etc.
 * Config file takes precedence when present and non-empty.
 */
export type UaisRunner = {
  id: string;
  label: string;
  cwd: string;
  command: string;
};

function getConfigPath(): string {
  const envPath = process.env.UAIS_RUNNERS_CONFIG?.trim();
  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
  }
  return path.join(process.cwd(), "config", "uais-runners.json");
}

function parseRunner(raw: unknown): UaisRunner | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  const label = typeof o.label === "string" ? o.label.trim() : "";
  const cwd = typeof o.cwd === "string" ? o.cwd.trim() : "";
  const command = typeof o.command === "string" ? o.command.trim() : "python main.py";
  if (!id || !cwd) return null;
  return { id, label: label || id, cwd, command: command || "python main.py" };
}

/** Load runners from config file. Returns null if file missing or invalid. */
export async function loadRunnersFromConfig(): Promise<UaisRunner[] | null> {
  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, "utf-8");
    const data = JSON.parse(content) as unknown;
    if (!Array.isArray(data)) return null;
    const runners = data.map(parseRunner).filter((r): r is UaisRunner => r !== null);
    return runners.length > 0 ? runners : null;
  } catch {
    return null;
  }
}

/** Sync version for use in getUaisRunners (which is sync). */
function loadRunnersFromConfigSync(): UaisRunner[] | null {
  try {
    const configPath = getConfigPath();
    const content = readFileSync(configPath, "utf-8");
    const data = JSON.parse(content) as unknown;
    if (!Array.isArray(data)) return null;
    const runners = data.map(parseRunner).filter((r): r is UaisRunner => r !== null);
    return runners.length > 0 ? runners : null;
  } catch {
    return null;
  }
}

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

/**
 * Canonical run order for "Run selected" (Athletic Screen first, then Readiness, Pro Sup, Pitching, Hitting, Arm Action, Curveball; Mobility with screens).
 * Proteus is out of scope for athlete profile flow but remains in the full list.
 */
export const UAIS_CANONICAL_RUN_ORDER: string[] = [
  "athletic-screen",
  "readiness-screen",
  "pro-sup",
  "pitching",
  "hitting",
  "arm-action",
  "curveball",
  "mobility",
];

/** Runner IDs used for "Run selected" multi-select (excludes proteus from default athlete-flow subset). */
export const UAIS_RUN_SELECTED_SUBSET = UAIS_CANONICAL_RUN_ORDER.filter((id) => id !== "proteus");

export function getUaisRunners(): UaisRunner[] {
  const fromConfig = loadRunnersFromConfigSync();
  if (fromConfig && fromConfig.length > 0) return fromConfig;
  return RUNNER_DEFS
    .map((d) => {
      const cwd = process.env[d.cwdEnv]?.trim();
      if (!cwd) return null;
      const command = process.env[d.cmdEnv]?.trim() || d.defaultCmd;
      return { id: d.id, label: d.label, cwd, command };
    })
    .filter((r): r is UaisRunner => r !== null);
}

/** Returns runners in canonical order (only those that are configured). */
export function getUaisRunnersInCanonicalOrder(): UaisRunner[] {
  const byId = new Map(getUaisRunners().map((r) => [r.id, r]));
  const ordered: UaisRunner[] = [];
  for (const id of UAIS_CANONICAL_RUN_ORDER) {
    const r = byId.get(id);
    if (r) ordered.push(r);
  }
  for (const r of byId.values()) {
    if (!UAIS_CANONICAL_RUN_ORDER.includes(r.id)) ordered.push(r);
  }
  return ordered;
}

export function getUaisRunner(id: string): UaisRunner | null {
  const runners = getUaisRunners();
  return runners.find((r) => r.id === id) ?? null;
}
