/**
 * Clean metric/category names for display in tables and charts.
 * Strips prefixes (PROCESSED., PLANE., etc.), replaces underscores with spaces,
 * and converts to title case (not all caps).
 */

const PREFIXES_TO_STRIP = [
  "PROCESSED.",
  "PLANE.",
  "TRACKMAN_METRICS.",
  "SUBJECT_METRICS.",
  "KINEMATIC_SEQUENCE.",
];

export function formatMetricDisplayName(name: string, category?: string): string {
  let s = name;
  for (const prefix of PREFIXES_TO_STRIP) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length);
      break;
    }
  }
  s = s.replace(/_/g, " ");
  return toTitleCase(s);
}

function toTitleCase(s: string): string {
  return s
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
