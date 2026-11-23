import process from "node:process";
import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { PublicInstitutionsController } from "../dist/geo/public-institutions.controller.js";

test("la consulta pública publica solo los atributos institucionales aprobados", async () => {
  const row = {
    source_id: 1,
    institution_key: "referencia-1",
    label: "Sede sintética",
    dane: "000000000001",
    parent_dane: "000000000001",
    principal: true,
    mapping_note: null,
    geometry: { type: "Point", coordinates: [-75.5, 5.06] },
    telefono: "excluir",
    correo_ins: "excluir",
  };
  const controller = new PublicInstitutionsController({
    client: { $queryRaw: async () => [row] },
  });
  const result = await controller.list({});
  assert.equal(result.features.length, 1);
  assert.deepEqual(
    Object.keys(result.features[0].properties).sort(),
    [
      "dane",
      "institutionKey",
      "label",
      "mappingBasis",
      "mappingNote",
      "parentDane",
      "principal",
      "source",
    ].sort(),
  );
  assert.equal(result.features[0].properties.mappingBasis, "reference-name");
  await assert.rejects(
    controller.list({ after: "cualquier-cursor" }),
    (e) => e.getStatus() === 400,
  );
});

test("la capa pública vacía devuelve FeatureCollection sin puntos", async () => {
  const controller = new PublicInstitutionsController({
    client: { $queryRaw: async () => [] },
  });
  assert.deepEqual(await controller.list({}), {
    type: "FeatureCollection",
    features: [],
  });
});

test(
  "HTTP sin token devuelve puntos públicos y conserva protección interna",
  { skip: !process.env.SIG_PUBLIC_API_TEST_URL },
  async () => {
    const base = process.env.SIG_PUBLIC_API_TEST_URL;
    const response = await fetch(base + "/api/v1/publico/sig/instituciones");
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.features.length, 21);
    assert.equal(
      new Set(body.features.map((f) => f.properties.institutionKey)).size,
      10,
    );
    assert.equal(new Set(body.features.map((f) => f.id)).size, 21);
    for (const feature of body.features) {
      assert.equal(feature.geometry.type, "Point");
      assert.equal(feature.geometry.coordinates.length, 2);
      assert.equal(feature.properties.telefono, undefined);
      assert.equal(feature.properties.correo_ins, undefined);
    }
    assert.equal(
      (await fetch(base + "/api/v1/publico/sig/instituciones?foo=bar")).status,
      400,
    );
    assert.equal(
      (
        await fetch(
          base +
            "/api/v1/interno/instituciones/00000000-0000-4000-8000-000000000001/sig/puntos?bbox=-76,4,-75,6",
        )
      ).status,
      401,
    );
  },
);
