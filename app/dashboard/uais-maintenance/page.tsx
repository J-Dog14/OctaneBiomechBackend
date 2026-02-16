"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Runner = { id: string; label: string };

export default function UaisMaintenancePage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<{ jobId: string; label: string } | null>(null);
  const [output, setOutput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const loadRunners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/uais/runners");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load runners");
      setRunners(data.runners ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load runners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRunners();
  }, [loadRunners]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const readStream = useCallback(async (jobId: string) => {
    setStreaming(true);
    setOutput("");
    try {
      const res = await fetch(`/api/dashboard/uais/stream?jobId=${encodeURIComponent(jobId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setOutput(`[Error] ${data.error ?? res.statusText}\n`);
        setActiveJob(null);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) {
        setOutput("[Error] No stream body\n");
        setActiveJob(null);
        return;
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
      outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      setOutput((prev) => prev + `\n[Error] ${e instanceof Error ? e.message : "Stream failed"}\n`);
    } finally {
      setStreaming(false);
      setActiveJob(null);
    }
  }, []);

  const runRunner = async (runner: Runner) => {
    setError(null);
    setActiveJob(null);
    setOutput("");
    try {
      const res = await fetch("/api/dashboard/uais/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runnerId: runner.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      const jobId = data.jobId;
      if (!jobId) throw new Error("No jobId returned");
      setActiveJob({ jobId, label: runner.label });
      readStream(jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start process");
    }
  };

  const sendInput = async () => {
    if (!activeJob?.jobId || !inputValue.trim()) return;
    try {
      const res = await fetch("/api/dashboard/uais/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: activeJob.jobId, input: inputValue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setOutput((prev) => prev + `\n[Send error] ${data.error ?? res.statusText}\n`);
      }
      setInputValue("");
    } catch (e) {
      setOutput((prev) => prev + `\n[Send error] ${e instanceof Error ? e.message : "Failed"}\n`);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>
        UAIS Maintenance
      </h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Run UAIS project scripts (main.py / main.R) from here. Output streams below; use the input
        field when a script prompts for input (e.g. athlete conflicts). Only works when this app
        runs on the machine that has the UAIS projects and Python/R installed.
      </p>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: "1rem",
            borderColor: "var(--accent-secondary)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>
          Runners (configure via env: UAIS_*_CWD and optional UAIS_*_CMD)
        </h2>
        {loading ? (
          <p className="text-muted">Loading runners…</p>
        ) : runners.length === 0 ? (
          <p className="text-muted">
            No runners configured. Set env vars like UAIS_ATHLETIC_SCREEN_CWD and
            UAIS_ATHLETIC_SCREEN_CMD (see lib/uais/runners.ts).
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {runners.map((r) => (
              <li key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{r.label}</span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => runRunner(r)}
                  disabled={streaming}
                >
                  Run
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(output || activeJob || streaming) && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
            {activeJob ? `${activeJob.label} — running` : "Output"}
          </h2>
          <pre
            style={{
              margin: 0,
              padding: "0.75rem",
              background: "var(--bg-primary)",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              maxHeight: "400px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {output || (streaming ? "Starting…" : "")}
            <span ref={outputEndRef} />
          </pre>
          {activeJob && (
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendInput()}
              placeholder="Type input for the process (e.g. 1 for conflict) and press Enter"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-primary" onClick={sendInput}>
              Send
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
