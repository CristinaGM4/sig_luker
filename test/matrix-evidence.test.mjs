import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { URL } from "node:url";

const evidence = JSON.parse(
  await readFile(
    new URL(
      "../docs/06-reglas-negocio/matriz-resultados-evidencia.v1.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

test("el inventario de la matriz conserva las 96 columnas sin filas nominales", () => {
  const fields = evidence.blocks.flatMap(({ fields }) => fields);
  assert.deepEqual(evidence.source.headerRows, [1, 2]);
  assert.equal(fields.length, 96);
  assert.deepEqual(
    fields.map(({ column }) =>
      [...column].reduce(
        (index, char) => index * 26 + char.charCodeAt(0) - 64,
        0,
      ),
    ),
    Array.from({ length: 96 }, (_, index) => index + 1),
  );
  for (const field of fields)
    assert.deepEqual(Object.keys(field).sort(), ["column", "row1", "row2"]);
});

test("la matriz separa las sugerencias y la procedencia IBITE", () => {
  const [suggestions, rights, provenance] = evidence.blocks.slice(-3);
  assert.equal(suggestions.id, "suggestions");
  assert.deepEqual(
    suggestions.fields.map(({ column }) => column),
    ["CJ", "CK", "CL", "CM", "CN"],
  );
  assert.equal(rights.fields[0].column, "CO");
  assert.equal(provenance.id, "ibiteProvenance");
  assert.deepEqual(
    provenance.fields.map(({ column, row1 }) => [column, row1]),
    [
      ["CP", "Institución educativa (IBITE)"],
      ["CQ", "Fila de origen (IBITE)"],
      ["CR", "Prioridad IBITE"],
    ],
  );
});
