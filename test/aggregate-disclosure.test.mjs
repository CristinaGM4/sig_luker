import assert from "node:assert/strict";
import { test } from "node:test";
import { suppressAggregateCut } from "../dist/ibite/aggregate-disclosure.js";

test("retiene celdas pequeñas y su total complementario", () => {
  assert.deepEqual(
    suppressAggregateCut(
      [
        { code: "A", count: 12 },
        { code: "B", count: 1 },
        { code: "C", count: 0 },
      ],
      5,
    ),
    {
      items: [
        { code: "A", state: "publicable", count: 12 },
        { code: "B", state: "no_disponible", count: null },
        { code: "C", state: "no_disponible", count: null },
      ],
      total: null,
    },
  );
});

test("acepta el límite y evita resultados engañosos de un corte sin celdas", () => {
  assert.equal(suppressAggregateCut([{ code: "A", count: 5 }], 5).total, 5);
  assert.deepEqual(suppressAggregateCut([], 5), { items: [], total: null });
});

test("rechaza umbrales inválidos, duplicados y desbordamiento", () => {
  assert.throws(() => suppressAggregateCut([], 0), RangeError);
  assert.throws(
    () => suppressAggregateCut([{ code: "A", count: -1 }], 5),
    RangeError,
  );
  assert.throws(
    () =>
      suppressAggregateCut(
        [
          { code: "A", count: 1 },
          { code: "A", count: 1 },
        ],
        5,
      ),
    RangeError,
  );
  assert.throws(
    () =>
      suppressAggregateCut(
        [
          { code: "A", count: Number.MAX_SAFE_INTEGER },
          { code: "B", count: 1 },
        ],
        5,
      ),
    RangeError,
  );
});
