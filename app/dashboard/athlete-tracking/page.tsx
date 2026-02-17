import Link from "next/link";

const ROOTS = [
  {
    path: "D:\\Athletic Screen 2.0\\Output Files",
    label: "Athletic Screen",
    description: "New athletic screen output files not yet inserted into the DB.",
  },
  {
    path: "H:\\Pitching\\Data\\",
    label: "Pitching",
    description: "New pitching data files not yet inserted.",
  },
  {
    path: "(Other project roots)",
    label: "Other roots",
    description: "Proteus, mobility, readiness, etc. can be added when paths are configured.",
  },
];

export default function AthleteTrackingPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>
        Athlete Tracking
      </h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Track new data files that have not yet been inserted into the database.
      </p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
          How this could work
        </h2>
        <p className="text-muted" style={{ marginBottom: "1rem" }}>
          The backend runs in Node/Next and typically cannot access Windows drives (e.g.{" "}
          <code>D:\</code>, <code>H:\</code>) from a browser or a server in the cloud. To track
          files on those paths you have two options:
        </p>
        <ul className="text-muted" style={{ margin: "0 0 1rem", paddingLeft: "1.5rem" }}>
          <li>
            <strong>Local watcher</strong>: A small script or desktop service on the machine that
            has access to <code>D:\</code> and <code>H:\</code> can watch folders and send file
            lists (or “pending” events) to this app via an API. The dashboard would then show
            “N new files in Athletic Screen”, “N new in Pitching”, etc.
          </li>
          <li>
            <strong>Manual scan</strong>: A dashboard button that triggers a scan (e.g. via a
            local agent or script that calls an API with the list of new files). The dashboard
            would display results after the scan.
          </li>
        </ul>
        <p className="text-muted">
          Once you have a way to report “pending files” (e.g. an API that accepts or returns
          them), we can hook this page up to show counts and “Run ingestion” actions.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {ROOTS.map((r) => (
          <div key={r.path} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{r.label}</h3>
                <code className="text-muted" style={{ fontSize: "12px" }}>{r.path}</code>
                <p className="text-muted" style={{ margin: "0.5rem 0 0", fontSize: "14px" }}>
                  {r.description}
                </p>
              </div>
              <span className="badge badge-neutral">Not connected</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-muted" style={{ marginTop: "1.5rem", fontSize: "13px" }}>
        <Link href="/dashboard">Back to dashboard</Link>
      </p>
    </div>
  );
}
