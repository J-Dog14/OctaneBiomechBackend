/**
 * Shared types for athlete tracking (percentiles, report).
 */

export type Orientation = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";

export type MetricWithPercentile = {
  category: string;
  name: string;
  value: number | null;
  valueUnit: string;
  orientation: Orientation | string | null;
  percentile: number | null;
  /** Optional max for display (e.g. mobility category "18 / 21"). */
  max?: number | null;
};

export type DomainId =
  | "pitching"
  | "hitting"
  | "mobility"
  | "athleticScreen"
  | "armAction"
  | "proteus";

export type DomainWithMetrics = {
  domainId: DomainId;
  label: string;
  metrics: MetricWithPercentile[];
  /** ISO date string (YYYY-MM-DD) of the session used for this domain. */
  sessionDate?: string | null;
};

export type AthleteTrackingReport = {
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
  /** Session counts per table (from report payload). */
  counts: {
    armAction: number;
    athleticScreen: number;
    mobility: number;
    proSup: number;
    proteus: number;
    readinessScreen: number;
    kinematicsPitching: number;
    kinematicsHitting: number;
    curveballTest: number;
  };
  /** Only domains that have data and for which we have a payload builder. */
  domains: DomainWithMetrics[];
};
