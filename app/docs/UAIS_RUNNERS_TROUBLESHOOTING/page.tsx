import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

export default async function UaisRunnersTroubleshootingPage() {
  const base = process.cwd();
  let content: string;
  try {
    content = await readFile(
      path.join(base, "docs", "UAIS_RUNNERS_TROUBLESHOOTING.md"),
      "utf-8"
    );
  } catch {
    content = "Troubleshooting doc not found.";
  }
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard/uais-maintenance">← UAIS Maintenance</Link>
      </p>
      <h1 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
        UAIS Runners Troubleshooting
      </h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
          lineHeight: 1.5,
          margin: 0,
          padding: "1rem",
          background: "var(--bg-primary)",
          borderRadius: "8px",
          overflow: "auto",
        }}
      >
        {content}
      </pre>
    </div>
  );
}
