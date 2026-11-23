import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyIbite17Record } from "../dist/ibite/ibite17-classification.js";
import { calculateIbite17Dimensions } from "../dist/ibite/ibite17-dimensions.js";
import { selectIbite17Orientation } from "../dist/ibite/ibite17-orientation.js";
import { classifyIbiteDa28Record } from "../dist/ibite/ibite-da28-classification.js";
import { calculateIbiteDa28Dimensions } from "../dist/ibite/ibite-da28-dimensions.js";
import { selectIbiteDa28Orientation } from "../dist/ibite/ibite-da28-orientation.js";

function sample(length, defaultAnswer, changes) {
  const answers = Array(length).fill(defaultAnswer);
  for (const [index, answer] of Object.entries(changes)) {
    answers[Number(index) - 1] = answer;
  }
  return answers;
}

function da(changes = {}, present = true) {
  const dimensions = calculateIbiteDa28Dimensions(sample(28, "Nada", changes));
  return selectIbiteDa28Orientation(
    dimensions,
    classifyIbiteDa28Record(dimensions, present),
  );
}

function ib(changes = {}, source = { present: true }, branch = "A") {
  const dimensions = calculateIbite17Dimensions(sample(17, "Nunca", changes));
  return selectIbite17Orientation(
    dimensions,
    classifyIbite17Record(dimensions, source),
    branch,
  );
}

test("DA conserva la clave ALERTA antes de INCOMPLETO y el orden de señales", () => {
  assert.equal(da({}, false), null);
  const result = da({ 1: null, 6: "Mucho", 7: "Poco", 21: "Mucho" });
  assert.equal(result.recommendationKey, "ALERTA");
  assert.equal(result.action, "valoracion_seguridad");
  assert.equal(result.timeframe, "mismo_dia");
  assert.deepEqual(result.signals, [
    "seguridad",
    "deterioro_funcional",
    "reintegracion",
    "afrontamiento",
    "comunidad",
    "institucional",
    "comunicacion",
  ]);
  assert.equal(da({ 7: "Poco", 8: null }).recommendationKey, "INCOMPLETO");
});

test("DA conserva prioridad y selecciona las claves de perfiles", () => {
  const stable = Object.fromEntries(
    [11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25, 26, 27].map((item) => [
      item,
      "Completamente",
    ]),
  );
  assert.deepEqual(da(stable), {
    action: "promocion_prevencion",
    timeframe: "seguimiento_habitual",
    route: "bienestar_docente_institucional",
    signals: [],
    recommendationKey: "1",
  });
  assert.equal(da().timeframe, "48_72_horas");
  assert.equal(da({ 6: "Mucho" }).timeframe, "dentro_de_la_semana");
  assert.equal(
    da({ ...stable, 13: "Poco", 24: "Poco" }).action,
    "fortalecer_apoyos",
  );
  assert.equal(
    da({ ...stable, 24: "Poco" }).action,
    "gestion_infraestructura_protocolos",
  );
});

test("IBITE-17 elige claves por rama y distingue las precedencias de las tres salidas", () => {
  assert.equal(ib({}, { present: false }), null);
  assert.equal(ib().recommendationKey, "4-A");
  assert.equal(ib({}, { present: true }, "B").recommendationKey, "4-B");
  assert.equal(ib({ 7: "Sí, una vez", 8: null }).recommendationKey, "4-A");
  const safety = ib(
    { 1: null, 2: null, 3: null, 7: "No sé o no puedo responder" },
    { present: true },
    "B",
  );
  assert.equal(safety.recommendationKey, "ALERTA-B");
  assert.equal(safety.action, "contacto_valoracion_seguridad");
  assert.equal(safety.timeframe, "mismo_dia");
  const elevatedSchool = ib({
    9: "Más de la mitad de los días",
    6: "Más de la mitad de los días",
  });
  assert.equal(elevatedSchool.action, "acompanamiento_psicosocial");
  assert.equal(elevatedSchool.timeframe, "48_72_horas_segun_ruta");
  assert.equal(elevatedSchool.route, "rectoria_orientacion_secretaria");
  assert.deepEqual(elevatedSchool.signals, ["deterioro_funcional", "escolar"]);
  const material = ib(
    { 9: "Más de la mitad de los días" },
    { present: true, housingDamage: "Daños graves o vivienda no habitable." },
  );
  assert.equal(material.route, "gestion_riesgo_humanitaria");
});
