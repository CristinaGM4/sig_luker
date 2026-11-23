import { classify, total, type ItemValue } from "./dimension-score.js";

export const IBITE_DA28_DIMENSIONS_VERSION = "ibite-da-28/excel-manizales/1";

const optionValues = new Map([
  ["nada", 0],
  ["nunca", 0],
  ["poco", 1],
  ["moderadamente", 2],
  ["mucho", 3],
  ["completamente", 4],
]);

export function calculateIbiteDa28Dimensions(
  answers: readonly (string | null)[],
) {
  if (answers.length !== 28) {
    throw new RangeError("IBITE-DA-28 requiere 28 posiciones de respuesta");
  }

  const items = Array.from(answers, (answer) =>
    typeof answer === "string"
      ? (optionValues.get(answer.toLowerCase()) ?? null)
      : null,
  );
  const emotionalDistress = total(items.slice(0, 4));
  const generalFunctional = total(items.slice(4, 6));
  const combined = total([emotionalDistress, generalFunctional]);
  const wellbeing = total([items[8], items[9], items[14]]);
  const workItems = items.slice(10, 12);
  const copingItems = [items[12], items[13], items[15]];
  const communityItems = items.slice(16, 20);

  const workReintegration = classify(total(workItems), 2, 5, "alto");
  const coping = classify(total(copingItems), 3, 7, "alto");
  const community = classify(total(communityItems), 4, 10, "alto");
  const insufficientCoping = flag(copingItems, (value) => value <= 1);
  const communityDisruption = flag(communityItems, (value) => value <= 1);
  const safety = flag(items.slice(6, 8), (value) => value >= 1);
  const coreAnsweredCount = items
    .slice(0, 20)
    .filter((value) => value !== null).length;

  return {
    ruleVersion: IBITE_DA28_DIMENSIONS_VERSION,
    items,
    coreAnsweredCount,
    coreComplete: coreAnsweredCount === 20,
    emotionalDistress: classify(emotionalDistress, 3, 7, "elevado"),
    generalFunctional,
    functionalImpairment: items[5] === null ? null : items[5] >= 3,
    combined: classify(combined, 5, 11, "elevado"),
    safetySignal:
      safety === null ? "sin_datos" : safety ? "alerta" : "sin_alerta",
    wellbeing: classify(wellbeing, 3, 7, "alto"),
    workReintegration,
    workReintegrationRisk: flag(workItems, (value) => value <= 1),
    coping,
    insufficientCoping,
    community,
    communityDisruption,
    structuralRisk: flag(items.slice(23, 27), (value) => value <= 1),
    mediaOverexposure: flag(items.slice(20, 22), (value) => value >= 3),
    copingAtRisk:
      insufficientCoping === null
        ? null
        : coping.level === "bajo" || insufficientCoping,
    communityAtRisk:
      communityDisruption === null
        ? null
        : community.level === "bajo" || communityDisruption,
  };
}

function flag(
  items: readonly ItemValue[],
  matches: (value: number) => boolean,
) {
  let active = false;
  for (const item of items) {
    if (item === null) {
      return null;
    }
    active = active || matches(item);
  }
  return active;
}
