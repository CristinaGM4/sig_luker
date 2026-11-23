import { createHash, randomUUID } from "node:crypto";
import type { PrismaClient } from "../generated/prisma/client.js";
import { readInstitutionPoints } from "./layer-preview.js";

export async function importInstitutionPoints(
  client: PrismaClient,
  file: Buffer,
  source: string,
  plan = false,
) {
  if (
    !file.length ||
    file.length > 5_000_000 ||
    !source.trim() ||
    source.length > 160
  )
    throw new Error("Archivo o fuente de puntos inválidos");
  const layer: unknown = JSON.parse(
    file.toString("utf8").replace(/^\uFEFF/, ""),
  );
  const sha256 = createHash("sha256").update(file).digest("hex");
  return client.$transaction(async (tx) => {
    if (plan) await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const institutions = await tx.institution.findMany({
      where: { active: true },
      select: { id: true, code: true },
    });
    const ids = new Map(institutions.map(({ id, code }) => [code, id]));
    const { points, ...report } = readInstitutionPoints(layer, [...ids.keys()]);
    if (!report.ready) return { ...report, inserted: 0, existing: 0 };
    if (plan) {
      const [current] = await tx.$queryRaw<{ count: number }[]>`
        SELECT count(*)::integer AS count FROM institution_map_points WHERE source_sha256 = ${sha256}
      `;
      return {
        ...report,
        inserted: 0,
        existing: current.count,
        pending: points.length - current.count,
      };
    }
    const batch = points.map(
      ({ position, institutionCode, label, longitude, latitude }) => ({
        id: randomUUID(),
        institution_id: ids.get(institutionCode),
        position,
        label,
        longitude,
        latitude,
      }),
    );
    const inserted = await tx.$executeRaw`
      INSERT INTO institution_map_points
        (id, institution_id, label, source, location, source_sha256, source_position)
      SELECT point.id, point.institution_id, point.label, ${source.trim()},
        ST_SetSRID(ST_MakePoint(point.longitude, point.latitude), 4326),
        ${sha256}, point.position
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS point(
        id uuid, institution_id uuid, position integer, label text,
        longitude double precision, latitude double precision
      )
      ON CONFLICT (source_sha256, source_position) DO NOTHING
    `;
    return { ...report, inserted, existing: points.length - inserted };
  });
}
