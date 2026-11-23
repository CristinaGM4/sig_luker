import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { test } from "node:test";
import { reviewMatrixSource } from "../dist/matrix/source-review.js";

const first = { fileSha256: "a".repeat(64), sheet: "Respuestas", row: 14 };
const second = { ...first, fileSha256: "b".repeat(64) };

test("la misma fila distingue archivos y exige procedencia expresa", () => {
  assert.deepEqual(reviewMatrixSource({ row: 14 }, [first, second]), {
    state: "missing_provenance",
  });
  assert.deepEqual(reviewMatrixSource({ row: 14 }, [first]), {
    state: "missing_provenance",
  });
  assert.deepEqual(reviewMatrixSource(second, [first, second]), {
    state: "located",
    coordinate: second,
  });
  assert.deepEqual(reviewMatrixSource(second, [first]), { state: "not_found" });
});

test("bloquea coordenadas inválidas, hojas distintas y un índice ambiguo", () => {
  assert.deepEqual(reviewMatrixSource({ ...first, row: 1 }, [first]), {
    state: "invalid",
  });
  assert.deepEqual(
    reviewMatrixSource({ ...first, fileSha256: "lote" }, [first]),
    { state: "invalid" },
  );
  assert.deepEqual(
    reviewMatrixSource({ ...first, sheet: "Otra hoja" }, [first]),
    { state: "not_found" },
  );
  assert.deepEqual(reviewMatrixSource(first, [first, first]), {
    state: "ambiguous",
  });
});

test("el comando informa estados por posición y rechaza campos nominales", () => {
  const run = (references) =>
    spawnSync(process.execPath, ["scripts/review-matrix-sources.mjs"], {
      input: JSON.stringify({
        references,
        authorizedCoordinates: [first, second],
      }),
      encoding: "utf8",
      timeout: 10000,
    });
  const output = run([{ row: 14 }, second]);
  assert.equal(output.status, 0);
  assert.deepEqual(JSON.parse(output.stdout), [
    { index: 1, state: "missing_provenance" },
    { index: 2, state: "located", coordinate: second },
  ]);
  const rejected = run([{ ...first, name: "Nombre ficticio" }]);
  assert.equal(rejected.status, 1);
  assert.equal(rejected.stdout, "");
  assert.doesNotMatch(rejected.stderr, /Nombre ficticio/);
});
