import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyIbite17Record } from "../dist/ibite/ibite17-classification.js";
import { calculateIbite17Dimensions } from "../dist/ibite/ibite17-dimensions.js";
import { classifyIbiteDa28Record } from "../dist/ibite/ibite-da28-classification.js";
import { calculateIbiteDa28Dimensions } from "../dist/ibite/ibite-da28-dimensions.js";

function answers(length, zero, changes) {
  const data = Array(length).fill(zero);
  for (const [item, value] of Object.entries(changes))
    data[Number(item) - 1] = value;
  return data;
}

function ibite17(changes = {}, source = {}) {
  const dimensions = calculateIbite17Dimensions(answers(17, "Nunca", changes));
  return classifyIbite17Record(dimensions, { present: true, ...source });
}

function ibiteDa(changes = {}, present = true) {
  const dimensions = calculateIbiteDa28Dimensions(answers(28, "Nada", changes));
  return classifyIbiteDa28Record(dimensions, present);
}

test("IBITE-17 distingue presencia, faltantes y perfiles del Excel", () => {
  assert.deepEqual(ibite17({}, { present: false }), {
    materialRisk: false,
    basicNeedsAffected: null,
    complete: null,
    profile: null,
    risk: null,
  });
  assert.equal(ibite17().profile, 4);
  assert.equal(ibite17({ 15: null }).profile, 5);
  assert.equal(ibite17({ 7: "Sí, una vez", 8: null }).profile, 4);
  const preserved = ibite17(
    Object.fromEntries(
      [12, 13, 14, 15, 17].map((item) => [item, "Casi todos los días"]),
    ),
  );
  assert.equal(preserved.profile, 1);
  assert.equal(preserved.risk, "bajo");
});

test("IBITE-17 conserva la precedencia de completitud, seguridad y contexto", () => {
  const material = {
    housingDamage: "Daños graves o vivienda no habitable.",
    basicNeeds: "Ninguna",
  };
  assert.equal(ibite17({}, material).risk, "alto_material");
  assert.equal(ibite17({}, material).basicNeedsAffected, false);
  assert.equal(ibite17({}, { basicNeeds: "Agua" }).basicNeedsAffected, true);
  const critical = ibite17(
    { 7: "No sé o no puedo responder", 8: "Sí, una vez" },
    material,
  );
  assert.equal(critical.profile, 3);
  assert.equal(critical.risk, "critico_seguridad");
  assert.equal(
    ibite17({ 7: "No sé o no puedo responder" }, material).risk,
    "alto_seguridad_no_aclarada",
  );
  assert.equal(
    ibite17({ 1: null, 2: null, 3: null, 7: "Sí, una vez" }, material).risk,
    "sin_datos_suficientes",
  );
});

test("IBITE-DA-28 asigna los perfiles 1 a 5 y su indicador general", () => {
  const resources = Object.fromEntries(
    [11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25, 26, 27].map((item) => [
      item,
      "Completamente",
    ]),
  );
  assert.equal(ibiteDa(resources).profile, 1);
  assert.equal(
    ibiteDa({ ...resources, 11: "Moderadamente", 12: "Moderadamente" }).profile,
    2,
  );
  assert.equal(ibiteDa().profile, 3);
  assert.equal(
    ibiteDa({ 11: "Moderadamente", 12: "Moderadamente" }).profile,
    4,
  );
  const mixed = ibiteDa({ ...resources, 13: "Poco" });
  assert.equal(mixed.profile, 5);
  assert.equal(mixed.risk, "medio");
});

test("IBITE-DA-28 aplica la precedencia del riesgo principal", () => {
  const resources = Object.fromEntries(
    [11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25, 26, 27].map((item) => [
      item,
      "Completamente",
    ]),
  );
  assert.equal(ibiteDa({}, false).primaryRisk, null);
  assert.equal(
    ibiteDa({ 7: "Poco", 8: null }).primaryRisk,
    "sin_datos_suficientes",
  );
  const critical = ibiteDa({ 7: "Poco", 6: "Mucho" });
  assert.equal(critical.primaryRisk, "vida_y_seguridad");
  assert.equal(critical.risk, "critico_seguridad");
  assert.equal(ibiteDa({ 6: "Mucho" }).primaryRisk, "malestar_y_deterioro");
  assert.equal(ibiteDa().primaryRisk, "reintegracion_laboral");
  assert.equal(
    ibiteDa({ 11: "Moderadamente", 12: "Moderadamente" }).primaryRisk,
    "recursos_o_comunidad",
  );
  assert.equal(
    ibiteDa({ ...resources, 24: "Poco" }).primaryRisk,
    "estructural_institucional",
  );
  assert.equal(ibiteDa(resources).primaryRisk, "sin_riesgo_prioritario");
  assert.equal(
    ibiteDa({ ...resources, 24: null, 25: null, 26: null, 27: null }).complete,
    true,
  );
});
