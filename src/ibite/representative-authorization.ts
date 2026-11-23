export type ReportedRepresentativeAuthorization = "authorized" | "unknown";

export function readReportedRepresentativeAuthorization(value: unknown) {
  if (value === undefined || value === "authorized" || value === "unknown") {
    return value;
  }
  throw new RangeError("Estado de autorización declarada inválido");
}

/** Counts one entry per definitive adolescent application in an eligible cut. */
export function countReportedRepresentativeAuthorization(
  values: Iterable<ReportedRepresentativeAuthorization | undefined>,
) {
  const counts = { authorized: 0, unknown: 0, missing: 0 };
  for (const value of values) {
    const status = readReportedRepresentativeAuthorization(value);
    counts[status ?? "missing"]++;
  }
  return counts;
}
