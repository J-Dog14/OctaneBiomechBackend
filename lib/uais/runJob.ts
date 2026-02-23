import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { UaisRunner } from "./runners";

/** Prepend R's bin to PATH so spawned jobs can find Rscript when the Next.js process didn't inherit it (e.g. Cursor/VS Code). */
function getEnvWithROnPath(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  let rBin: string | null = null;
  if (process.env.R_HOME) {
    const candidate = path.join(process.env.R_HOME, "bin");
    if (existsSync(candidate)) rBin = candidate;
  }
  if (!rBin && process.platform === "win32") {
    const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
    const rRoot = path.join(programFiles, "R");
    if (existsSync(rRoot)) {
      const dirs = readdirSync(rRoot).filter((d) => d.startsWith("R-"));
      if (dirs.length > 0) {
        dirs.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        const bin = path.join(rRoot, dirs[0], "bin");
        if (existsSync(bin)) rBin = bin;
      }
    }
  }
  if (!rBin) return env;
  const pathSep = process.platform === "win32" ? ";" : ":";
  const current = env.PATH ?? env.Path ?? "";
  return { ...env, PATH: rBin + pathSep + current, Path: rBin + pathSep + current };
}

type Job = {
  runner: UaisRunner;
  process: ChildProcess;
  chunks: Uint8Array[];
  controller: ReadableStreamDefaultController<Uint8Array> | null;
  done: boolean;
};

const jobs = new Map<string, Job>();

function pushChunk(jobId: string, chunk: Uint8Array) {
  const job = jobs.get(jobId);
  if (!job) return;
  // Only buffer until first client attaches; then stream directly to avoid unbounded memory growth (OOM).
  if (!job.controller) job.chunks.push(chunk);
  if (job.controller) {
    try {
      job.controller.enqueue(chunk);
    } catch {
      // stream may be closed
    }
  }
}

function onExit(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;
  job.done = true;
  if (job.controller) {
    try {
      job.controller.close();
    } catch {
      // ignore
    }
    job.controller = null;
  }
  jobs.delete(jobId);
}

export type CreateJobOptions = {
  /** When set (Existing Athlete flow), passed as ATHLETE_UUID to the process. */
  athleteUuid?: string | null;
};

export function createJob(runner: UaisRunner, options?: CreateJobOptions): string {
  const jobId = crypto.randomUUID();
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (options?.athleteUuid?.trim()) {
    env.ATHLETE_UUID = options.athleteUuid.trim();
  }
  const envWithPath = getEnvWithROnPath(env);
  const proc = spawn(runner.command, [], {
    shell: true,
    cwd: runner.cwd,
    env: envWithPath,
  });

  const job: Job = {
    runner,
    process: proc,
    chunks: [],
    controller: null,
    done: false,
  };
  jobs.set(jobId, job);

  proc.stdout?.on("data", (data: Buffer) => pushChunk(jobId, data));
  proc.stderr?.on("data", (data: Buffer) => pushChunk(jobId, data));
  proc.on("error", (err) => {
    pushChunk(jobId, new TextEncoder().encode(`\n[Process error] ${err.message}\n`));
  });
  proc.on("exit", (code, signal) => {
    const msg = code != null
      ? `\n[Process exited with code ${code}]\n`
      : `\n[Process exited with signal ${signal}]\n`;
    pushChunk(jobId, new TextEncoder().encode(msg));
    onExit(jobId);
  });

  return jobId;
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export function attachStreamController(jobId: string, controller: ReadableStreamDefaultController<Uint8Array>): void {
  const job = jobs.get(jobId);
  if (!job) return;
  job.controller = controller;
  // Send any buffered chunks that were received before the client connected
  for (const chunk of job.chunks) {
    try {
      controller.enqueue(chunk);
    } catch {
      break;
    }
  }
  job.chunks = []; // Free buffer; new output streams directly via pushChunk
}

export function writeInput(jobId: string, input: string): boolean {
  const job = jobs.get(jobId);
  if (!job?.process.stdin || job.done) return false;
  job.process.stdin.write(input);
  return true;
}
