import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareIbiteAnswers } from "../dist/ibite/submission-input.js";

test("normaliza el orden del contexto y copia las entradas para finalizar", () => {
  const original = ["Nunca", null];
  const context = { injury: undefined };
  assert.throws(() => prepareIbiteAnswers(original, context), /desconocido/);
  const first = prepareIbiteAnswers(original, {
    housingDamage: "Ninguno",
    basicNeeds: null,
  });
  const second = prepareIbiteAnswers(original, {
    basicNeeds: null,
    housingDamage: "Ninguno",
  });
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.notDeepEqual(
    first.context,
    prepareIbiteAnswers(original, { housingDamage: "Ninguno" }).context,
  );
  original[0] = "Varios días";
  assert.equal(first.items[0], "Nunca");
});

test("rechaza listas con huecos y tipos que no pueden persistirse como respuestas", () => {
  for (const input of [
    null,
    { item: "Nunca" },
    [1],
    [undefined],
    new Array(1),
  ]) {
    assert.throws(() => prepareIbiteAnswers(input, {}), RangeError);
  }
  assert.throws(
    () => prepareIbiteAnswers([], { basicNeeds: false }),
    RangeError,
  );
  for (const context of [new Date(), new Map(), { [Symbol()]: "texto" }]) {
    assert.throws(() => prepareIbiteAnswers([], context), RangeError);
  }
});
