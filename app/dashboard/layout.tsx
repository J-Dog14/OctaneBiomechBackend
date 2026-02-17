import Link from "next/link";
import { DashboardNav } from "./DashboardNav";

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
        <DashboardNav />
      </header>
      <main style={{ flex: 1, padding: "1.5rem" }}>{children}</main>
    </div>
  );
}
