import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewFieldSession } from "../dist/field-notes/session-review.js";

const places = [
  { code: "L001", locationStatus: "pending" },
  { code: "L002", locationStatus: "pending" },
];

test("revisa vínculos múltiples o ausentes y conserva ubicaciones pendientes", () => {
  assert.deepEqual(
    reviewFieldSession({
      sessionCode: "S01",
      places,
      findings: [
        { code: "H001", placeCodes: ["L001", "L002"] },
        { code: "H005", placeCodes: [] },
      ],
    }),
    { findings: 2, places: 2, ready: true, issues: [] },
  );
});

test("detecta cruces huérfanos, códigos duplicados y coordenadas no autorizadas", () => {
  const result = reviewFieldSession({
    sessionCode: "S01",
    places: [
      places[0],
      places[0],
      { code: "L003", locationStatus: "pending", coordinates: [0, 0] },
    ],
    findings: [
      { code: "H001", placeCodes: ["L001", "L001"] },
      { code: "H001", placeCodes: ["L003"] },
    ],
  });
  assert.equal(result.ready, false);
  assert.deepEqual(
    result.issues.map(({ reason }) => reason),
    [
      "duplicate_place_code",
      "invalid_place_reference",
      "duplicate_place_link",
      "duplicate_finding_code",
      "place_not_found",
    ],
  );
  assert.throws(() =>
    reviewFieldSession({
      sessionCode: "S01",
      places: [],
      findings: [],
      participantName: "Ficticio",
    }),
  );
});
