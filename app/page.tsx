import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "var(--font-sans)", maxWidth: "640px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Octane Biomech</h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Biomechanics data API and dashboard.
      </p>
      <Link
        href="/dashboard"
        className="btn-primary"
        style={{ display: "inline-block" }}
      >
        Open dashboard
      </Link>
    </div>
  );
}

