import process from "node:process";
import { URL } from "node:url";
import { log } from "node:console";
import { readFile } from "node:fs/promises";
import { createDatabaseClient } from "../dist/database/database-client.js";
const document = JSON.parse(
  await readFile(
    new URL(
      "../outputs/sig/instituciones-publicas-revision.geojson",
      import.meta.url,
    ),
    "utf8",
  ),
);
if (
  document.type !== "FeatureCollection" ||
  document.features.length !== 21 ||
  !document.features.every(
    (f) =>
      f.geometry.type === "Point" &&
      /^referencia-([1-9]|10)$/.test(f.properties.institutionKey),
  )
)
  throw new Error("Colección revisada inválida");
const client = createDatabaseClient(process.env.DATABASE_URL);
try {
  await client.$transaction(async (tx) => {
    await tx.$executeRaw`LOCK TABLE public_institution_sites IN SHARE ROW EXCLUSIVE MODE`;
    const [existing] =
      await tx.$queryRaw`SELECT count(*)::integer AS count, bool_and(source_sha256=${document.sourceSha256}) AS same FROM public_institution_sites`;
    if (existing.count) {
      if (!existing.same || existing.count !== 21)
        throw new Error(
          "La edición existente difiere. Se conservó sin cambios.",
        );
      return;
    }
    for (const feature of document.features) {
      const p = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;
      await tx.$executeRaw`INSERT INTO public_institution_sites (source_id,institution_key,label,dane,parent_dane,principal,mapping_note,source_sha256,location) VALUES (${feature.id},${p.institutionKey},${p.label},${p.dane},${p.parentDane},${p.principal},${p.mappingNote},${document.sourceSha256},ST_SetSRID(ST_MakePoint(${lon},${lat}),4326))`;
    }
  });
  log("21 puntos institucionales públicos disponibles.");
} finally {
  await client.$disconnect();
}
