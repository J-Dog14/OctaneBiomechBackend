import Link from "next/link";
import { getAthletesList } from "@/lib/dashboard/athletes";
import { AthletesSearchForm } from "./AthletesSearchForm";

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cursor?: string }>;
}) {
  const params = await searchParams;
  const { items, nextCursor } = await getAthletesList({
    q: params.q,
    limit: 30,
    cursor: params.cursor,
  });

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>
        Athletes
      </h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Browse d_athletes and session counts per table (proteus, pitching, athletic screen, etc.).
      </p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <AthletesSearchForm initialQ={params.q} />
      </div>

      <section className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Age group</th>
              <th>Pitching</th>
              <th>Athletic screen</th>
              <th>Proteus</th>
              <th>Mobility</th>
              <th>Readiness</th>
              <th>Arm action</th>
              <th>Hitting</th>
              <th>Curveball</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.athlete_uuid}>
                <td>{a.name}</td>
                <td>{a.gender ?? "—"}</td>
                <td>{a.age_group ?? "—"}</td>
                <td>{a.pitching_session_count}</td>
                <td>{a.athletic_screen_session_count}</td>
                <td>{a.proteus_session_count}</td>
                <td>{a.mobility_session_count}</td>
                <td>{a.readiness_screen_session_count}</td>
                <td>{a.arm_action_session_count}</td>
                <td>{a.hitting_session_count}</td>
                <td>{a.curveball_test_session_count}</td>
                <td>
                  <Link href={`/dashboard/athletes/${a.athlete_uuid}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="text-muted" style={{ padding: "1rem 0" }}>
            No athletes found.
          </p>
        )}
        {nextCursor && (
          <div style={{ marginTop: "1rem" }}>
            <Link
              href={`/dashboard/athletes?cursor=${encodeURIComponent(nextCursor)}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
              className="btn-ghost"
              style={{ display: "inline-block" }}
            >
              Load more
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
