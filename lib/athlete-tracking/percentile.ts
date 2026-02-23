/**
 * Percentile rank computation for athlete metrics.
 * Higher-is-better: higher value => higher percentile.
 * Lower-is-better: lower value => higher percentile (we invert so "percentile" means "better than X%").
 */

import type { Orientation } from "./types";

/**
 * Compute percentile rank (0-100) for a value within a population.
 * - HIGHER_IS_BETTER: percentile = % of population with value < this value.
 * - LOWER_IS_BETTER: we rank by "lower is better", so percentile = % of population with value > this value.
 */
export function computePercentileRank(
  value: number,
  populationValues: number[],
  orientation: Orientation | string | null
): number | null {
  const valid = populationValues.filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );
  if (valid.length === 0) return null;

  const n = valid.length;
  if (orientation === "LOWER_IS_BETTER") {
    // Lower value is better: count how many have value > this value (worse than this)
    const countWorse = valid.filter((v) => v > value).length;
    return (countWorse / n) * 100;
  }
  // HIGHER_IS_BETTER (default): count how many have value < this value (worse than this)
  const countWorse = valid.filter((v) => v < value).length;
  return (countWorse / n) * 100;
}

export function metricKey(category: string, name: string): string {
  return `${category}|${name}`;
}
