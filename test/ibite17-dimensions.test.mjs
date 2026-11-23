import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateIbite17Dimensions } from "../dist/ibite/ibite17-dimensions.js";

const options = [
  "Nunca",
  "Varios días",
  "Más de la mitad de los días",
  "Casi todos los días",
];

function sample(changes = {}) {
  const answers = Array(17).fill("Nunca");
  for (const [item, answer] of Object.entries(changes)) {
    answers[Number(item) - 1] = answer;
  }
  return calculateIbite17Dimensions(answers);
}

test("calcula los límites de malestar del Excel IBITE-17", () => {
  for (const [values, score, level] of [
    [[2], 2, "bajo"],
    [[3], 3, "intermedio"],
    [[3, 2], 5, "intermedio"],
    [[3, 3], 6, "elevado"],
  ]) {
    const answers = Object.fromEntries(
      values.map((v, i) => [i + 1, options[v]]),
    );
    assert.deepEqual(sample(answers).posttraumatic, { score, level });
  }
  for (const [values, score, level] of [
    [[3, 1], 4, "bajo"],
    [[3, 2], 5, "intermedio"],
    [[3, 3, 3], 9, "intermedio"],
    [[3, 3, 3, 1], 10, "elevado"],
  ]) {
    const answers = Object.fromEntries(
      values.map((v, i) => [i + 1, options[v]]),
    );
    assert.deepEqual(sample(answers).combined, { score, level });
  }
});

test("preserva faltantes, invierte el ítem 16 y separa las señales", () => {
  const fullResources = sample({
    12: options[3],
    13: options[3],
    14: options[3],
    15: options[3],
    17: options[3],
  });
  assert.deepEqual(fullResources.personal, { score: 9, level: "alto" });
  assert.deepEqual(fullResources.family, { score: 9, level: "alto" });
  assert.equal(sample({ 16: options[3] }).family.score, 0);
  const incomplete = sample({ 2: null, 3: "fuera de catálogo", 15: null });
  assert.equal(incomplete.answeredCount, 14);
  assert.deepEqual(incomplete.posttraumatic, { score: null, level: null });
  assert.deepEqual(incomplete.combined, { score: null, level: null });
  assert.deepEqual(incomplete.family, { score: null, level: null });
  assert.equal(
    sample({ 6: options[2], 10: options[2] }).functionalImpairment,
    true,
  );
  assert.equal(sample({ 9: null, 10: options[2] }).schoolDisengagement, null);
  assert.equal(sample({ 10: options[2] }).schoolDisengagement, true);
});

test("reproduce la precedencia de seguridad sin emitir alertas", () => {
  const unknown = "No sé o no puedo responder";
  const yes = "Sí, una vez";
  assert.equal(sample({ 7: unknown, 8: yes }).safetySignal, "alerta");
  assert.equal(sample({ 7: unknown, 8: "No" }).safetySignal, "no_aclarada");
  assert.equal(sample({ 7: unknown, 8: "No" }).answeredCount, 17);
  assert.equal(sample({ 7: yes, 8: null }).safetySignal, "sin_datos");
  assert.equal(sample({ 7: "No", 8: "No" }).safetySignal, "ninguna");
  assert.throws(() => sample({ 1: unknown }), RangeError);
  assert.throws(() => calculateIbite17Dimensions([]), RangeError);
});
