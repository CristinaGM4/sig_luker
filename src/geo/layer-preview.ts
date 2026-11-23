function object(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function code(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    value.length > 0 &&
    value.length <= 120
  );
}

export function readInstitutionPoints(
  layer: unknown,
  institutionCodes: readonly string[],
) {
  if (
    !Array.isArray(institutionCodes) ||
    !institutionCodes.length ||
    !institutionCodes.every(code) ||
    new Set(institutionCodes).size !== institutionCodes.length
  ) {
    throw new Error(
      "El catálogo requiere códigos institucionales exactos y únicos",
    );
  }
  const collection = object(layer);
  if (
    !collection ||
    collection.type !== "FeatureCollection" ||
    !Array.isArray(collection.features) ||
    !collection.features.length ||
    collection.features.length > 10_000 ||
    Object.hasOwn(collection, "crs")
  ) {
    throw new Error(
      "Se requiere una FeatureCollection WGS84 de 1 a 10.000 entidades, sin declaración crs",
    );
  }
  const codes = new Set(institutionCodes);
  const seen = new Set<string>();
  const issues: { position: number; reason: string }[] = [];
  const points: {
    position: number;
    institutionCode: string;
    label: string;
    longitude: number;
    latitude: number;
  }[] = [];
  for (const [index, item] of collection.features.entries()) {
    const feature = object(item);
    const properties = object(feature?.properties);
    const geometry = object(feature?.geometry);
    const coordinates = geometry?.coordinates;
    const institutionCode = properties?.institutionCode;
    const label = properties?.label;
    const position = index + 1;
    if (
      feature?.type !== "Feature" ||
      geometry?.type !== "Point" ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number" ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1]) ||
      Math.abs(coordinates[0]) > 180 ||
      Math.abs(coordinates[1]) > 90
    ) {
      issues.push({ position, reason: "invalid_point" });
      continue;
    }
    if (!code(institutionCode) || !codes.has(institutionCode)) {
      issues.push({ position, reason: "unknown_institution_code" });
      continue;
    }
    if (typeof label !== "string" || !label.trim() || label.length > 160) {
      issues.push({ position, reason: "invalid_label" });
      continue;
    }
    const key = JSON.stringify([institutionCode, ...coordinates]);
    if (seen.has(key)) {
      issues.push({ position, reason: "duplicate_point" });
      continue;
    }
    seen.add(key);
    points.push({
      position,
      institutionCode,
      label: label.trim(),
      longitude: coordinates[0],
      latitude: coordinates[1],
    });
  }
  return {
    total: collection.features.length,
    valid: points.length,
    rejected: issues.length,
    ready: issues.length === 0,
    issues,
    points,
  };
}

export function previewInstitutionPoints(
  layer: unknown,
  institutionCodes: readonly string[],
) {
  const { total, valid, rejected, ready, issues } = readInstitutionPoints(
    layer,
    institutionCodes,
  );
  return { total, valid, rejected, ready, issues };
}
