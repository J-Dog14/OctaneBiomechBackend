"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MetricRadarChart, type RadarMetric, type RadarDataSeries, SERIES_COLORS } from "./MetricRadarChart";
import { formatMetricDisplayName } from "@/lib/athlete-tracking/displayNames";

type AthleteItem = {
  athlete_uuid: string;
  name: string;
};

type MetricWithPercentile = {
  category: string;
  name: string;
  value: number | null;
  valueUnit: string;
  orientation: string | null;
  percentile: number | null;
  max?: number | null;
};

type DomainWithMetrics = {
  domainId: string;
  label: string;
  metrics: MetricWithPercentile[];
  sessionDate?: string | null;
};

type AthleteTrackingReport = {
  generatedAt: string;
  athlete: {
    athleteUuid: string;
    name: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    height?: string | null;
    weight?: string | null;
    email?: string | null;
  };
  counts: Record<string, number>;
  domains: DomainWithMetrics[];
};

/** One point per unique metric; value is percentile or normalized (value/max*100) for mobility categories. */
function metricsToRadarData(metrics: MetricWithPercentile[]): RadarMetric[] {
  const seen = new Set<string>();
  const out: RadarMetric[] = [];
  for (const m of metrics) {
    let chartValue: number;
    let displaySuffix: string;
    if (m.percentile != null && Number.isFinite(m.percentile)) {
      chartValue = m.percentile;
      displaySuffix = `${Math.round(m.percentile)}th %ile`;
    } else if (m.max != null && m.value != null && m.max > 0) {
      chartValue = (m.value / m.max) * 100;
      displaySuffix = `${Number(m.value).toFixed(0)} / ${m.max}`;
    } else continue;
    const uniqueKey = `${m.category} – ${m.name}`;
    if (seen.has(uniqueKey)) continue;
    seen.add(uniqueKey);
    const shortLabel = uniqueKey.length > 16 ? uniqueKey.slice(0, 14) + "…" : uniqueKey;
    out.push({
      subject: shortLabel,
      value: chartValue,
      fullMark: 100,
      displayValue: `${formatMetricDisplayName(m.name, m.category)}: ${displaySuffix}`,
    });
  }
  return out;
}

/** Top 5 highest and top 5 lowest percentiles across all domains (for Highlights vs Lowlights). */
function getHighlightsAndLowlights(
  domains: DomainWithMetrics[]
): { highlights: Array<{ domainLabel: string; metric: MetricWithPercentile }>; lowlights: Array<{ domainLabel: string; metric: MetricWithPercentile }> } {
  const withPct: Array<{ domainLabel: string; metric: MetricWithPercentile }> = [];
  for (const d of domains) {
    for (const m of d.metrics) {
      if (m.percentile != null && Number.isFinite(m.percentile)) {
        withPct.push({ domainLabel: d.label, metric: m });
      }
    }
  }
  const sorted = [...withPct].sort(
    (a, b) => (a.metric.percentile ?? 0) - (b.metric.percentile ?? 0)
  );
  const lowlights = sorted.slice(0, 5);
  const highlights = sorted.slice(-5).reverse();
  return { highlights, lowlights };
}

function AthleteTrackingContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialAthlete = searchParams.get("athlete") ?? "";
  const initialCurrent = searchParams.get("current") ?? "";

  const [athletes, setAthletes] = useState<AthleteItem[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [trackedUuids, setTrackedUuids] = useState<string[]>([]);
  const [currentUuid, setCurrentUuid] = useState<string>("");
  const [report, setReport] = useState<AthleteTrackingReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [compareUuid, setCompareUuid] = useState<string | null>(null);
  const [compareReport, setCompareReport] = useState<AthleteTrackingReport | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [addAthleteQuery, setAddAthleteQuery] = useState("");

  const loadAthletes = useCallback(async () => {
    setLoadingAthletes(true);
    try {
      const res = await fetch("/api/dashboard/athletes?limit=10000");
      const data = await res.json();
      if (data.items) setAthletes(data.items);
    } finally {
      setLoadingAthletes(false);
    }
  }, []);

  useEffect(() => {
    loadAthletes();
  }, [loadAthletes]);

  useEffect(() => {
    if (initialAthlete && athletes.length > 0) {
      const uuids = initialAthlete.split(",").map((s) => s.trim()).filter(Boolean);
      if (uuids.length > 0) {
        setTrackedUuids((prev) => {
          const combined = new Set([...prev, ...uuids]);
          return Array.from(combined);
        });
        if (initialCurrent && uuids.includes(initialCurrent)) {
          setCurrentUuid(initialCurrent);
        } else if (!currentUuid) {
          setCurrentUuid(uuids[0]!);
        }
      }
    }
  }, [initialAthlete, initialCurrent, athletes.length]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (trackedUuids.length > 0) params.set("athlete", trackedUuids.join(","));
    if (currentUuid) params.set("current", currentUuid);
    const q = params.toString();
    const path = `/dashboard/athlete-tracking${q ? `?${q}` : ""}`;
    if (typeof window !== "undefined" && window.location.pathname + window.location.search !== path) {
      router.replace(path, { scroll: false });
    }
  }, [trackedUuids, currentUuid, router]);

  const fetchReport = useCallback(async (athleteUuid: string) => {
    setLoadingReport(true);
    setReportError(null);
    try {
      const res = await fetch(
        `/api/dashboard/athlete-tracking/report?athleteUuid=${encodeURIComponent(athleteUuid)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setReportError(data.error ?? "Failed to load report");
        setReport(null);
        return;
      }
      setReport(data);
      setPageIndex(0);
    } catch (e) {
      setReportError(e instanceof Error ? e.message : "Request failed");
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  }, []);

  useEffect(() => {
    if (currentUuid) fetchReport(currentUuid);
  }, [currentUuid, fetchReport]);

  useEffect(() => {
    if (!compareUuid || compareUuid === currentUuid) {
      setCompareReport(null);
      return;
    }
    setLoadingCompare(true);
    setCompareReport(null);
    fetch(`/api/dashboard/athlete-tracking/report?athleteUuid=${encodeURIComponent(compareUuid)}`)
      .then(async (res) => {
        const data = await res.json();
        return res.ok ? data : null;
      })
      .then((data) => setCompareReport(data))
      .catch(() => setCompareReport(null))
      .finally(() => setLoadingCompare(false));
  }, [compareUuid, currentUuid]);

  const addTracked = (uuid: string) => {
    if (trackedUuids.includes(uuid)) return;
    setTrackedUuids((prev) => [...prev, uuid]);
    if (!currentUuid) setCurrentUuid(uuid);
  };

  const removeTracked = (uuid: string) => {
    setTrackedUuids((prev) => prev.filter((id) => id !== uuid));
    if (currentUuid === uuid) {
      const next = trackedUuids.filter((id) => id !== uuid);
      setCurrentUuid(next[0] ?? "");
    }
  };

  const { highlights, lowlights } =
    report && report.domains.length > 0
      ? getHighlightsAndLowlights(report.domains)
      : { highlights: [] as Array<{ domainLabel: string; metric: MetricWithPercentile }>, lowlights: [] as Array<{ domainLabel: string; metric: MetricWithPercentile }> };

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>
        Athlete Tracking
      </h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Select athletes and view percentiles by domain (pitching, hitting, mobility, etc.).
      </p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
          Select athlete
        </h2>
        {loadingAthletes ? (
          <p className="text-muted">Loading athletes…</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              type="text"
              placeholder="Search by name…"
              value={addAthleteQuery}
              onChange={(e) => setAddAthleteQuery(e.target.value)}
              style={{ width: 200 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {athletes
                .filter(
                  (a) =>
                    !trackedUuids.includes(a.athlete_uuid) &&
                    (!addAthleteQuery.trim() ||
                      a.name.toLowerCase().includes(addAthleteQuery.toLowerCase()))
                )
                .slice(0, 20)
                .map((a) => (
                  <button
                    key={a.athlete_uuid}
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: "13px" }}
                    onClick={() => addTracked(a.athlete_uuid)}
                  >
                    + {a.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>
          Tracked athletes
        </h3>
        {trackedUuids.length === 0 ? (
          <p className="text-muted">Add an athlete above to get started.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            {trackedUuids.map((uuid) => {
              const name = athletes.find((a) => a.athlete_uuid === uuid)?.name ?? uuid.slice(0, 8);
              const isCurrent = currentUuid === uuid;
              return (
                <span
                  key={uuid}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: isCurrent ? "var(--accent-muted)" : "var(--bg-tertiary)",
                    border: `1px solid ${isCurrent ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "2px 6px", fontSize: "13px" }}
                    onClick={() => setCurrentUuid(uuid)}
                    title="View this athlete"
                  >
                    {name}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "2px 4px", fontSize: "12px" }}
                    onClick={() => removeTracked(uuid)}
                    title="Remove from tracked"
                    aria-label={`Remove ${name}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!currentUuid && (
        <p className="text-muted">
          <Link href="/dashboard">Back to dashboard</Link>
        </p>
      )}

      {currentUuid && (
        <>
          {loadingReport && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <p className="text-muted">Loading report…</p>
            </div>
          )}
          {reportError && (
            <div className="card" style={{ marginBottom: "1rem", borderColor: "var(--accent-secondary)" }}>
              <p className="text-danger">{reportError}</p>
            </div>
          )}
          {report && !loadingReport && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem" }}>
                  {report.athlete.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  <label htmlFor="compare-athlete" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Compare with:
                  </label>
                  <select
                    id="compare-athlete"
                    value={compareUuid ?? ""}
                    onChange={(e) => setCompareUuid(e.target.value ? e.target.value : null)}
                    disabled={loadingCompare}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      minWidth: 180,
                    }}
                  >
                    <option value="">— None —</option>
                    {athletes
                      .filter((a) => a.athlete_uuid !== currentUuid)
                      .map((a) => (
                        <option key={a.athlete_uuid} value={a.athlete_uuid}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                  {loadingCompare && <span className="text-muted" style={{ fontSize: "0.85rem" }}>Loading…</span>}
                </div>
                <div
                  role="tablist"
                  aria-label="Test categories"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.35rem",
                  }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pageIndex === 0}
                    aria-controls="tab-panel-0"
                    id="tab-0"
                    onClick={() => setPageIndex(0)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1px solid ${pageIndex === 0 ? "var(--accent)" : "var(--border)"}`,
                      background: pageIndex === 0 ? "var(--accent-muted)" : "var(--bg-tertiary)",
                      color: pageIndex === 0 ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: pageIndex === 0 ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    Highlights vs Lowlights
                  </button>
                  {report.domains.map((d, idx) => (
                    <button
                      key={d.domainId}
                      type="button"
                      role="tab"
                      aria-selected={pageIndex === idx + 1}
                      aria-controls={`tab-panel-${idx + 1}`}
                      id={`tab-${idx + 1}`}
                      onClick={() => setPageIndex(idx + 1)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: `1px solid ${pageIndex === idx + 1 ? "var(--accent)" : "var(--border)"}`,
                        background: pageIndex === idx + 1 ? "var(--accent-muted)" : "var(--bg-tertiary)",
                        color: pageIndex === idx + 1 ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: pageIndex === idx + 1 ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {d.sessionDate ? `${d.label} (${d.sessionDate})` : d.label}
                    </button>
                  ))}
                </div>
              </div>

              {pageIndex === 0 && (
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>
                    Highlights vs Lowlights
                  </h3>
                  {(highlights.length === 0 && lowlights.length === 0) ? (
                    <p className="text-muted">No domain data for this athlete.</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--accent)" }}>Highlights</h4>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {highlights.map(({ domainLabel, metric }, i) => (
                            <li key={`high-${i}-${domainLabel}-${metric.name}`} style={{ marginBottom: "0.35rem" }}>
                              {formatMetricDisplayName(metric.name, metric.category)} <span className="text-muted">({domainLabel})</span>{" "}
                              <span className="text-accent">{Math.round(metric.percentile ?? 0)}th %ile</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--accent-secondary)" }}>Lowlights</h4>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {lowlights.map(({ domainLabel, metric }, i) => (
                            <li key={`low-${i}-${domainLabel}-${metric.name}`} style={{ marginBottom: "0.35rem" }}>
                              {formatMetricDisplayName(metric.name, metric.category)} <span className="text-muted">({domainLabel})</span>{" "}
                              <span className="text-danger">{Math.round(metric.percentile ?? 0)}th %ile</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {pageIndex >= 1 && report.domains[pageIndex - 1] && (() => {
                const domain = report.domains[pageIndex - 1]!;
                const compareDomain = compareReport?.domains.find((d) => d.domainId === domain.domainId);
                const series: RadarDataSeries[] = [
                  { name: report.athlete.name, data: metricsToRadarData(domain.metrics), color: SERIES_COLORS[0]! },
                ];
                if (compareDomain && compareReport) {
                  series.push({
                    name: compareReport.athlete.name,
                    data: metricsToRadarData(compareDomain.metrics),
                    color: SERIES_COLORS[1]!,
                  });
                }
                return (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <MetricRadarChart
                      title={
                        domain.sessionDate
                          ? `${domain.label} (${domain.sessionDate}) – percentiles`
                          : `${domain.label} – percentiles`
                      }
                      data={series.length === 1 ? series[0]!.data : undefined}
                      dataSeries={series.length > 1 ? series : undefined}
                    />
                  </div>
                  <div className="card">
                    <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>
                      Metrics{domain.sessionDate ? ` · ${domain.sessionDate}` : ""}
                    </h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>Value</th>
                          <th>Percentile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.domains[pageIndex - 1]!.metrics.map((m, i) => (
                          <tr key={`${report.domains[pageIndex - 1]!.domainId}-${i}-${m.category}-${m.name}`}>
                            <td>{formatMetricDisplayName(m.name, m.category)}</td>
                            <td>
                              {m.value != null
                                ? m.max != null
                                  ? `${Number(m.value).toFixed(0)} / ${m.max}`
                                  : `${Number(m.value).toFixed(2)} ${m.valueUnit}`
                                : "—"}
                            </td>
                            <td>
                              {m.percentile != null ? (
                                <span className={m.percentile < 25 ? "text-danger" : ""}>
                                  {Math.round(m.percentile)}th %ile
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
                );
              })()}
            </>
          )}

          <p className="text-muted" style={{ marginTop: "1.5rem", fontSize: "13px" }}>
            <Link href="/dashboard">Back to dashboard</Link>
          </p>
        </>
      )}
    </div>
  );
}

export function AthleteTrackingContent() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <AthleteTrackingContentInner />
    </Suspense>
  );
}
