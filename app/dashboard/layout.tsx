import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <header
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            color: "var(--text-primary)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1.15rem",
          }}
        >
          Octane Biomech
        </Link>
        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            href="/dashboard"
            className="nav-link"
            style={{ color: "var(--text-secondary)", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/athletes"
            className="nav-link"
            style={{ color: "var(--text-secondary)", textDecoration: "none" }}
          >
            Athletes
          </Link>
          <Link
            href="/dashboard/send-payload"
            className="nav-link"
            style={{ color: "var(--text-secondary)", textDecoration: "none" }}
          >
            Send Payload
          </Link>
          <Link
            href="/dashboard/data-roots"
            className="nav-link"
            style={{ color: "var(--text-secondary)", textDecoration: "none" }}
          >
            Data Roots
          </Link>
          <Link
            href="/dashboard/uais-maintenance"
            className="nav-link"
            style={{ color: "var(--text-secondary)", textDecoration: "none" }}
          >
            UAIS Maintenance
          </Link>
        </nav>
      </header>
      <main style={{ flex: 1, padding: "1.5rem" }}>{children}</main>
    </div>
  );
}
