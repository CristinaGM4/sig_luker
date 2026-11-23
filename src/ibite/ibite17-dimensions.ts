import { classify, total, type ItemValue } from "./dimension-score.js";

export const IBITE17_DIMENSIONS_VERSION = "ibite-17/excel-23/1";

const optionValues = new Map([
  ["nunca", 0],
  ["varios días", 1],
  ["más de la mitad de los días", 2],
  ["algunos días", 1],
  ["muchos días", 2],
  ["casi todos los días", 3],
  ["no", 0],
  ["sí, una vez", 1],
  ["sí, más de una vez", 2],
  ["sí, actualmente o de forma repetida", 3],
  ["no sé o no puedo responder", 9],
]);

export function calculateIbite17Dimensions(
  answers: readonly (string | null)[],
) {
  if (answers.length !== 17) {
    throw new RangeError("IBITE-17 requiere 17 posiciones de respuesta");
  }

  const items = Array.from(answers, (answer, index) => {
    const score =
      typeof answer === "string"
        ? (optionValues.get(answer.toLowerCase()) ?? null)
        : null;
    if (score === 9 && index !== 6 && index !== 7) {
      throw new RangeError("El código 9 solo se admite en los ítems 7 y 8");
    }
    return score;
  });
  const posttraumatic = total(items.slice(0, 4));
  const generalFunctional = total(items.slice(4, 6));
  const combined = total([posttraumatic, generalFunctional]);
  const schoolItems = items.slice(8, 11);
  const school = total(schoolItems);
  const personal = total(items.slice(11, 14));
  const item16 = items[15];
  const family = total([
    items[14],
    item16 === null ? null : 3 - item16,
    items[16],
  ]);

  return {
    ruleVersion: IBITE17_DIMENSIONS_VERSION,
    items,
    answeredCount: items.filter((value) => value !== null).length,
    posttraumatic: classify(posttraumatic, 2, 5, "elevado"),
    generalFunctional,
    functionalImpairment: items[5] === null ? null : items[5] >= 2,
    combined: classify(combined, 4, 9, "elevado"),
    safetySignal: safetySignal(items[6], items[7]),
    school: classify(school, 1, 4, "elevado"),
    schoolDisengagement:
      school === null
        ? null
        : schoolItems.some((value) => value !== null && value >= 2),
    personal: classify(personal, 3, 6, "alto"),
    family: classify(family, 3, 6, "alto"),
  };
}

function safetySignal(first: ItemValue, second: ItemValue) {
  if (first === null || second === null) {
    return "sin_datos";
  }
  if ([first, second].some((score) => score >= 1 && score <= 3)) {
    return "alerta";
  }
  if (first === 9 || second === 9) {
    return "no_aclarada";
  }
  return "ninguna";
}
