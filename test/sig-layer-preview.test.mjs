import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rmdir, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { test } from "node:test";
import { previewInstitutionPoints } from "../dist/geo/layer-preview.js";

const collection = (...features) => ({ type: "FeatureCollection", features });
const point = (institutionCode, coordinates, label = "Sede ficticia") => ({
  type: "Feature",
  properties: { institutionCode, label },
  geometry: { type: "Point", coordinates },
});
const catalog = ["QA-01"];
const valid = point("QA-01", [-75.5, 5.1]);

test("detecta geometría, coordenadas, duplicados, etiquetas y códigos que no se pueden resolver", () => {
  const report = previewInstitutionPoints(
    collection(
      valid,
      point("QA-01", [-75.5, 5.1]),
      point("QA-01", [-75.6, 5.1]),
      point("qa-01", [-75.5, 5.1]),
      point("QA-01", [500000, 1000000]),
      point("QA-01", [-75.5, 5.1, 20]),
      point("QA-01", [-75.5, 5.1], ""),
      { ...valid, geometry: { type: "Polygon", coordinates: [] } },
    ),
    catalog,
  );
  assert.deepEqual(report, {
    total: 8,
    valid: 2,
    rejected: 6,
    ready: false,
    issues: [
      { position: 2, reason: "duplicate_point" },
      { position: 4, reason: "unknown_institution_code" },
      { position: 5, reason: "invalid_point" },
      { position: 6, reason: "invalid_point" },
      { position: 7, reason: "invalid_label" },
      { position: 8, reason: "invalid_point" },
    ],
  });
});

test("rechaza la declaración de otro CRS y un catálogo ambiguo", () => {
  assert.throws(
    () => previewInstitutionPoints({ ...collection(valid), crs: {} }, catalog),
    /WGS84/,
  );
  assert.throws(
    () => previewInstitutionPoints(collection(valid), ["QA-01", "QA-01"]),
    /únicos/,
  );
});

test("el comando comunica aceptación y rechazo sin exponer coordenadas ni abrir una base", async (context) => {
  const folder = await mkdtemp(join(tmpdir(), "sig-layer-preview-"));
  const layer = join(folder, "points.geojson");
  const codes = join(folder, "codes.json");
  context.after(async () => {
    await unlink(layer);
    await unlink(codes);
    await rmdir(folder);
  });
  await writeFile(codes, JSON.stringify(catalog));
  const run = () =>
    spawnSync(
      process.execPath,
      ["scripts/preview-sig-layer.mjs", layer, codes],
      {
        encoding: "utf8",
        timeout: 10000,
      },
    );
  await writeFile(layer, JSON.stringify(collection(valid)));
  const accepted = run();
  assert.equal(accepted.status, 0);
  assert.equal(JSON.parse(accepted.stdout).ready, true);
  await writeFile(
    layer,
    JSON.stringify(collection(point("QA-02", [-75.5, 5.1]))),
  );
  const rejected = run();
  assert.equal(rejected.status, 2);
  assert.doesNotMatch(rejected.stdout, /QA-02|-75\.5/);
});
