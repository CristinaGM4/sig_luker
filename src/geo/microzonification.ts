import { createHash } from "node:crypto";
import type { PrismaClient } from "../generated/prisma/client.js";

export const microzonificationLegend = {
  A: "Cenizas",
  B: "Rellenos",
  P: "Rocas, flujos y depósitos de poco espesor",
  T: "Límite zonificado",
} as const;

export type Zone = keyof typeof microzonificationLegend;

export const microzonificationYear = 2002;

interface SourceFeature {
  type?: unknown;
  id?: number;
  properties?: { zona?: unknown; descripcion?: unknown };
  geometry?: { type?: unknown };
}

export async function importMicrozonification(
  client: PrismaClient,
  data: Buffer,
  plan = false,
) {
  if (data.length > 5_000_000)
    throw new Error("Archivo de microzonificación demasiado grande");
  const document = JSON.parse(data.toString("utf8"));
  if (
    document?.type !== "FeatureCollection" ||
    !Array.isArray(document.features) ||
    document.features.length === 0 ||
    document.features.length > 1000 ||
    "crs" in document
  )
    throw new Error("Colección de microzonificación inválida");

  const ids = new Set<number>();
  const rows = document.features.map((feature: SourceFeature | null) => {
    const id = feature?.id;
    const zone = feature?.properties?.zona;
    const description = feature?.properties?.descripcion;
    if (
      feature?.type !== "Feature" ||
      typeof id !== "number" ||
      !Number.isInteger(id) ||
      id < 1 ||
      id > 2147483647 ||
      ids.has(id) ||
      typeof zone !== "string" ||
      !Object.hasOwn(microzonificationLegend, zone) ||
      typeof description !== "string" ||
      !description.trim() ||
      description.length > 300 ||
      feature.geometry?.type !== "MultiPolygon" ||
      "crs" in feature.geometry
    )
      throw new Error("Entidad de microzonificación inválida");

    ids.add(id);
    return { id, zone, description, geometry: feature.geometry };
  });
  const digest = createHash("sha256").update(data).digest("hex");

  return client.$transaction(async (tx) => {
    // A single historical edition is loaded at a time.
    if (plan) await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    else
      await tx.$executeRaw`LOCK TABLE microzonification_zones IN SHARE ROW EXCLUSIVE MODE`;
    const [existing] = await tx.$queryRaw<
      { count: number; same: boolean | null }[]
    >`
      SELECT count(*)::integer AS count, bool_and(source_sha256 = ${digest}) AS same
      FROM microzonification_zones
    `;
    if (existing.count) {
      if (!existing.same || existing.count !== rows.length)
        throw new Error("La capa instalada difiere del archivo de origen");
      return { inserted: 0, total: existing.count, sha256: digest, pending: 0 };
    }
    if (plan) {
      const [check] = await tx.$queryRaw<{ valid: boolean }[]>`
        SELECT bool_and(GeometryType(geom) = 'MULTIPOLYGON' AND ST_NDims(geom) = 2
          AND NOT ST_IsEmpty(geom) AND ST_IsValid(geom)
          AND ST_CoveredBy(geom, ST_MakeEnvelope(-180, -90, 180, 90, 4326))) AS valid
        FROM (
          SELECT ST_SetSRID(ST_GeomFromGeoJSON(geometry), 4326) AS geom
          FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS feature(geometry jsonb)
        ) AS polygons
      `;
      if (!check.valid)
        throw new Error("Geometría de microzonificación inválida");
      return {
        inserted: 0,
        total: rows.length,
        sha256: digest,
        pending: rows.length,
      };
    }
    const inserted = await tx.$executeRaw`
      INSERT INTO microzonification_zones (id, source_sha256, zone, source_description, geometry)
      SELECT id, ${digest}, zone, description,
             ST_SetSRID(ST_GeomFromGeoJSON(geometry), 4326)
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
        AS feature(id integer, zone text, description text, geometry jsonb)
    `;
    return { inserted, total: rows.length, sha256: digest, pending: 0 };
  });
}
