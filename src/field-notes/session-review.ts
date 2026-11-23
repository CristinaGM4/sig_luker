type RecordValue = Record<string, unknown>;
type Issue = { section: string; position: number; reason: string };

function record(value: unknown): RecordValue {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("Se esperaba un objeto de estructura");
  return value as RecordValue;
}

function only(row: RecordValue, fields: readonly string[]) {
  return Object.keys(row).every((key) => fields.includes(key));
}

export function reviewFieldSession(input: unknown) {
  const batch = record(input);
  if (
    !only(batch, ["sessionCode", "findings", "places"]) ||
    typeof batch.sessionCode !== "string" ||
    !/^S[0-9]{2,12}$/.test(batch.sessionCode) ||
    !Array.isArray(batch.findings) ||
    !Array.isArray(batch.places)
  ) {
    throw new Error("Estructura de sesión inválida");
  }
  const issues: Issue[] = [];
  const placeCodes = new Set<string>();
  const findingCodes = new Set<string>();
  for (const [index, raw] of batch.places.entries()) {
    const place = record(raw);
    const position = index + 1;
    if (
      !only(place, ["code", "locationStatus"]) ||
      typeof place.code !== "string" ||
      !/^L[0-9]{3,12}$/.test(place.code) ||
      place.locationStatus !== "pending"
    ) {
      issues.push({
        section: "places",
        position,
        reason: "invalid_place_reference",
      });
      continue;
    }
    if (placeCodes.has(place.code)) {
      issues.push({
        section: "places",
        position,
        reason: "duplicate_place_code",
      });
    }
    placeCodes.add(place.code);
  }
  for (const [index, raw] of batch.findings.entries()) {
    const finding = record(raw);
    const position = index + 1;
    if (
      !only(finding, ["code", "placeCodes"]) ||
      typeof finding.code !== "string" ||
      !/^H[0-9]{3,12}$/.test(finding.code) ||
      !Array.isArray(finding.placeCodes)
    ) {
      issues.push({
        section: "findings",
        position,
        reason: "invalid_finding_reference",
      });
      continue;
    }
    if (findingCodes.has(finding.code)) {
      issues.push({
        section: "findings",
        position,
        reason: "duplicate_finding_code",
      });
    }
    findingCodes.add(finding.code);
    const linked = finding.placeCodes;
    if (new Set(linked).size !== linked.length) {
      issues.push({
        section: "findings",
        position,
        reason: "duplicate_place_link",
      });
    }
    if (
      linked.some((code) => typeof code !== "string" || !placeCodes.has(code))
    ) {
      issues.push({ section: "findings", position, reason: "place_not_found" });
    }
  }
  return {
    findings: batch.findings.length,
    places: batch.places.length,
    ready: issues.length === 0,
    issues,
  };
}
