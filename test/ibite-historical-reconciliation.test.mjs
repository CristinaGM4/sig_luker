import assert from "node:assert/strict";
import { test } from "node:test";
import { reconcileHistoricalWorkbook } from "../dist/ibite/historical-reconciliation.js";

const source = {
  sourceSha256: "A".repeat(64),
  responseSheet: "Respuestas",
  scoringSheet: "Puntuaciones",
};

test("concilia unidades separadas sin crear respuestas para filas vacías", () => {
  const input = {
    ...source,
    responses: [
      { row: 2, timestampValid: true, institutionLabel: " Instituto A " },
    ],
    scores: [
      { row: 2, responseRow: 2 },
      { row: 7558, responseRow: 7560 },
    ],
    aliases: [{ label: "instituto a", institutionCode: "A" }],
  };
  const report = reconcileHistoricalWorkbook(input);
  assert.deepEqual(reconcileHistoricalWorkbook(input), report);
  assert.equal(report.responses[0].institutionCandidate, "A");
  assert.equal(report.responses[0].status, "conciliada");
  assert.deepEqual(report.scores[1].responseOrigin, {
    sourceSha256: "a".repeat(64),
    sheet: "Respuestas",
    row: 7560,
  });
  assert.deepEqual(report.totals, {
    responses: 1,
    responsesInReview: 0,
    scores: 2,
    scoresWithUnresolvedReference: 0,
    scoresWithoutSource: 1,
    scoresWithRepeatedSource: 0,
  });
  assert.equal(JSON.stringify(report).includes("Instituto A"), false);
});

test("retiene referencias duplicadas y alias ambiguos para revisión", () => {
  const report = reconcileHistoricalWorkbook({
    ...source,
    responses: [
      { row: 1228, timestampValid: false, institutionLabel: "Instituto" },
      { row: 1229, timestampValid: true, institutionLabel: null },
    ],
    scores: [
      { row: 1000, responseRow: 1228 },
      { row: 1001, responseRow: 1228 },
    ],
    aliases: [
      { label: "Instituto", institutionCode: "B" },
      { label: " instituto ", institutionCode: "A" },
    ],
  });
  assert.deepEqual(
    report.scores.map(({ status }) => status),
    ["referencia_repetida", "referencia_repetida"],
  );
  assert.deepEqual(report.responses[0].issues, [
    "fecha_ausente_o_invalida",
    "institucion_ambigua",
    "calculo_repetido",
  ]);
  assert.equal(report.responses[0].institutionCandidate, null);
  assert.deepEqual(report.responses[0].candidates, ["A", "B"]);
  assert.deepEqual(report.responses[1].issues, [
    "institucion_ausente",
    "sin_calculo",
  ]);
  assert.equal(report.totals.responsesInReview, 2);
  assert.equal(report.totals.scoresWithRepeatedSource, 2);
});

test("rechaza metadatos y coordenadas inválidas", () => {
  const input = { ...source, responses: [], scores: [], aliases: [] };
  assert.throws(
    () => reconcileHistoricalWorkbook({ ...input, sourceSha256: "inválida" }),
    RangeError,
  );
  assert.throws(
    () =>
      reconcileHistoricalWorkbook({
        ...input,
        scores: [
          { row: 2, responseRow: 3 },
          { row: 2, responseRow: 4 },
        ],
      }),
    /repetida/,
  );
  assert.throws(
    () =>
      reconcileHistoricalWorkbook({
        ...input,
        scores: [{ row: 2, responseRow: 0 }],
      }),
    /Coordenada/,
  );
});

test("los alias ortográficos son sugerencias y nunca reemplazan el alias directo", () => {
  const report = reconcileHistoricalWorkbook({
    ...source,
    responses: [
      { row: 2, timestampValid: true, institutionLabel: "Institucion - A" },
      { row: 3, timestampValid: true, institutionLabel: "Institución A" },
      { row: 4, timestampValid: true, institutionLabel: "Institucion B" },
    ],
    scores: [
      { row: 2, responseRow: 2 },
      { row: 3, responseRow: 3 },
      { row: 4, responseRow: 4 },
    ],
    aliases: [
      { label: "Institución A", institutionCode: "A" },
      { label: "Institución B", institutionCode: "B" },
      { label: "Institución-B", institutionCode: "C" },
    ],
  });
  assert.deepEqual(report.responses[0].issues, [
    "institucion_alias_ortografico",
  ]);
  assert.deepEqual(report.responses[0].candidates, ["A"]);
  assert.equal(report.responses[0].institutionCandidate, null);
  assert.equal(report.responses[1].institutionCandidate, "A");
  assert.deepEqual(report.responses[2].issues, ["institucion_ambigua"]);
  assert.deepEqual(report.responses[2].candidates, ["B", "C"]);
});

test("conserva coordenadas de cálculo sin un anclaje de origen resoluble", () => {
  const report = reconcileHistoricalWorkbook({
    ...source,
    responses: [],
    aliases: [],
    scores: [
      { row: 2, responseRow: null },
      { row: 3, responseRow: 42 },
    ],
  });
  assert.equal(report.totals.scores, 2);
  assert.equal(report.totals.scoresWithUnresolvedReference, 1);
  assert.equal(report.totals.scoresWithoutSource, 1);
  assert.equal(report.scores[0].origin.row, 2);
  assert.equal(report.scores[0].responseOrigin, null);
  assert.equal(report.scores[0].status, "referencia_no_resuelta");
});
