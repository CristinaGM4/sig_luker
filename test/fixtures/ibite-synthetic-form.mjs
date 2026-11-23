import { readFileSync } from "node:fs";
import { URL } from "node:url";

const evidence = JSON.parse(
  readFileSync(
    new URL(
      "../../docs/06-reglas-negocio/ibite17-formularios-evidencia.v2.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const optionIds = ["zero", "one", "two", "three", "unclear"];
function makeForms(verifiedItems) {
  return evidence.variants.map(({ variant, scoredItems, evidenceVersion }) => ({
    instrumentCode: evidence.instrumentCode,
    variant,
    sourceVersion: evidence.sourceVersion,
    formVersion: verifiedItems
      ? evidenceVersion
      : `ibite-17-${variant === "ADOLESCENT" ? "adolescente" : "acudiente"}-sintetico/2`,
    questions: scoredItems.map(({ header }, index) => {
      const position = index + 1;
      const scale = evidence.scales.find(
        ({ items }) => position >= items[0] && position <= items[1],
      );
      return {
        id: "q" + position,
        text: verifiedItems ? header : "Pregunta sintética " + position,
        options: scale.options.map((value, option) => ({
          id: optionIds[option],
          text: value,
          sourceValue: value,
        })),
      };
    }),
  }));
}

const [caregiverForm, syntheticIbiteForm] = makeForms(false);
const verifiedIbiteForms = makeForms(true);

export { caregiverForm, syntheticIbiteForm, verifiedIbiteForms };
