import { spawn, type ChildProcess } from "node:child_process";
import type { UaisRunner } from "./runners";

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
  job.chunks.push(chunk);
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

export function createJob(runner: UaisRunner): string {
  const jobId = crypto.randomUUID();
  const isWindows = process.platform === "win32";
  const proc = spawn(runner.command, [], {
    shell: true,
    cwd: runner.cwd,
    env: { ...process.env },
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
}

export function writeInput(jobId: string, input: string): boolean {
  const job = jobs.get(jobId);
  if (!job?.process.stdin || job.done) return false;
  job.process.stdin.write(input);
  return true;
}
