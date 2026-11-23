export type ItemValue = number | null;
type Level = "bajo" | "intermedio" | "elevado" | "alto";
export function total(items: readonly ItemValue[]): ItemValue {
  let sum = 0;
  for (const item of items) {
    if (item === null) {
      return null;
    }
    sum += item;
  }
  return sum;
}

export function classify(
  score: ItemValue,
  lowMax: number,
  intermediateMax: number,
  topLevel: "alto" | "elevado",
): { score: ItemValue; level: Level | null } {
  if (score === null) {
    return { score, level: null };
  }
  if (score <= lowMax) {
    return { score, level: "bajo" };
  }
  if (score <= intermediateMax) {
    return { score, level: "intermedio" };
  }
  return { score, level: topLevel };
}
