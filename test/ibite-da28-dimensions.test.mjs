import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateIbiteDa28Dimensions } from "../dist/ibite/ibite-da28-dimensions.js";

const options = ["Nada", "Poco", "Moderadamente", "Mucho", "Completamente"];

function sample(changes = {}) {
  const answers = Array(28).fill("Nada");
  for (const [item, option] of Object.entries(changes)) {
    answers[Number(item) - 1] = option;
  }
  return calculateIbiteDa28Dimensions(answers);
}

test("IBITE-DA-28 usa su escala 0 a 4 y los cortes del Excel", () => {
  assert.deepEqual(
    sample({ 1: "Nunca", 2: "Completamente" }).items.slice(0, 2),
    [0, 4],
  );
  for (const [dimension, maxItems, cases] of [
    [
      "emotionalDistress",
      4,
      [
        [3, "bajo"],
        [4, "intermedio"],
        [7, "intermedio"],
        [8, "elevado"],
      ],
    ],
    [
      "combined",
      6,
      [
        [5, "bajo"],
        [6, "intermedio"],
        [11, "intermedio"],
        [12, "elevado"],
      ],
    ],
  ]) {
    for (const [score, level] of cases) {
      const changes = Object.fromEntries(
        Array.from({ length: maxItems }, (_, index) => [
          index + 1,
          options[Math.min(4, Math.max(0, score - 4 * index))],
        ]),
      );
      assert.deepEqual(sample(changes)[dimension], { score, level });
    }
  }
  assert.throws(() => calculateIbiteDa28Dimensions([]), RangeError);
});

test("IBITE-DA-28 preserva faltantes y distingue núcleo y contexto", () => {
  assert.equal(sample().safetySignal, "sin_alerta");
  assert.equal(sample({ 7: "Poco" }).safetySignal, "alerta");
  const missingSafety = sample({ 7: "Poco", 8: null });
  assert.equal(missingSafety.safetySignal, "sin_datos");
  assert.equal(missingSafety.coreComplete, false);
  const incompleteWithSafety = sample({ 1: null, 7: "Poco" });
  assert.equal(incompleteWithSafety.safetySignal, "alerta");
  assert.equal(incompleteWithSafety.coreAnsweredCount, 19);
  assert.equal(incompleteWithSafety.combined.score, null);
  const coreOnly = sample(
    Object.fromEntries(
      Array.from({ length: 8 }, (_, index) => [index + 21, null]),
    ),
  );
  assert.equal(coreOnly.coreComplete, true);
  assert.equal(coreOnly.structuralRisk, null);
  assert.equal(coreOnly.mediaOverexposure, null);
  assert.equal(sample({ 7: "No sé o no puedo responder" }).items[6], null);
});

test("IBITE-DA-28 calcula dominios y banderas fuera del malestar", () => {
  const result = sample({
    6: "Mucho",
    9: "Completamente",
    10: "Completamente",
    11: "Moderadamente",
    12: "Completamente",
    13: "Poco",
    14: "Completamente",
    15: "Completamente",
    16: "Completamente",
    17: "Completamente",
    18: "Completamente",
    19: "Completamente",
    20: "Completamente",
    21: "Mucho",
  });
  assert.equal(result.functionalImpairment, true);
  assert.deepEqual(result.wellbeing, { score: 12, level: "alto" });
  assert.deepEqual(result.workReintegration, { score: 6, level: "alto" });
  assert.equal(result.workReintegrationRisk, false);
  assert.deepEqual(result.coping, { score: 9, level: "alto" });
  assert.equal(result.copingAtRisk, true);
  assert.deepEqual(result.community, { score: 16, level: "alto" });
  assert.equal(result.communityAtRisk, false);
  assert.equal(result.structuralRisk, true);
  assert.equal(result.mediaOverexposure, true);
  assert.equal(sample({ 16: null }).copingAtRisk, null);
  assert.equal(sample({ 25: null }).structuralRisk, null);
});
