import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import process from "node:process";
import { test } from "node:test";
import { URL } from "node:url";
import { createApp } from "../dist/app.js";
import { DatabaseService } from "../dist/database/database.module.js";
import { importMicrozonification } from "../dist/geo/microzonification.js";

const databaseUrl = process.env.DATABASE_TEST_URL;
const square = [
  [-75.6, 5],
  [-75.5, 5],
  [-75.5, 5.1],
  [-75.6, 5.1],
  [-75.6, 5],
];
function collection(count, lastRing = square) {
  return Buffer.from(
    JSON.stringify({
      type: "FeatureCollection",
      features: Array.from({ length: count }, (_, index) => ({
        type: "Feature",
        id: index + 1,
        properties: {
          zona: "P",
          descripcion: "Descripción sintética de origen",
        },
        geometry: {
          type: "MultiPolygon",
          coordinates: [[index + 1 === count ? lastRing : square]],
        },
      })),
    }),
  );
}

test(
  "carga atómica, reintento y consulta pública paginada de microzonificación",
  {
    skip: !databaseUrl && "DATABASE_TEST_URL no está configurada",
  },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");
    const app = await createApp(false, databaseUrl);
    const { client } = app.get(DatabaseService);
    let digest;
    context.after(async () => {
      try {
        if (digest)
          await client.$executeRaw`DELETE FROM microzonification_zones WHERE source_sha256 = ${digest}`;
      } finally {
        await app.close();
      }
    });
    await app.listen(0, "127.0.0.1");
    const path = (await app.getUrl()) + "/api/v1/publico/sig/microzonificacion";
    const catalog = (await app.getUrl()) + "/api/v1/publico/sig/capas";
    const bbox = "?bbox=-76,4,-75,6";
    const invalidRing = [square[0], square[2], square[1], square[3], square[0]];
    await assert.rejects(
      importMicrozonification(client, collection(2, invalidRing)),
    );
    assert.equal((await (await fetch(path + bbox)).json()).features.length, 0);
    const data = collection(21);
    assert.deepEqual(await (await fetch(catalog)).json(), { layers: [] });
    await assert.rejects(
      importMicrozonification(client, collection(2, invalidRing), true),
    );
    assert.equal(
      (await importMicrozonification(client, data, true)).pending,
      21,
    );
    assert.deepEqual(await (await fetch(catalog)).json(), { layers: [] });
    const imported = await importMicrozonification(client, data);
    digest = imported.sha256;
    assert.equal(imported.inserted, 21);
    assert.equal((await importMicrozonification(client, data)).inserted, 0);
    assert.equal(
      (await importMicrozonification(client, data, true)).pending,
      0,
    );
    await assert.rejects(
      importMicrozonification(client, collection(20)),
      /difiere/,
    );

    const result = await fetch(path + bbox);
    assert.equal(result.status, 200);
    assert.match(result.headers.get("content-type"), /^application\/geo\+json/);
    const page = await result.json();
    const { layers } = await (await fetch(catalog)).json();
    assert.equal(layers.length, 1);
    assert.equal(
      layers[0].featuresPath,
      "/api/v1/publico/sig/microzonificacion",
    );
    assert.equal(layers[0].historical, true);
    assert.equal(layers[0].legend.P, page.features[0].properties.label);
    assert.equal(page.type, "FeatureCollection");
    assert.equal(page.features.length, 20);
    assert.equal(page.features[0].geometry.type, "MultiPolygon");
    assert.deepEqual(page.features[0].properties, {
      zone: "P",
      label: "Rocas, flujos y depósitos de poco espesor",
      mapYear: 2002,
    });
    assert.equal(page.nextCursor, 20);
    const final = await (await fetch(path + bbox + "&after=20")).json();
    assert.deepEqual(
      final.features.map(({ id }) => id),
      [21],
    );
    assert.equal(final.nextCursor, null);
    assert.equal(
      (await (await fetch(path + "?bbox=0,0,1,1")).json()).features.length,
      0,
    );
    for (const query of [
      "",
      "?bbox=0,0,0,1",
      bbox + "&after=-1",
      bbox + "&bbox=0,0,1,1",
    ])
      assert.equal((await fetch(path + query)).status, 400);
  },
);
