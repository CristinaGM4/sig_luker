/** Operational observations are separate from the historical Excel classification. */
export function observeIbiteSafety(
  items: readonly (number | null)[],
  instrumentCode: "IBITE-17" | "IBITE-DA-28",
) {
  const maximum = instrumentCode === "IBITE-17" ? 3 : 4;
  const observedItems: number[] = [];
  const missingItems: number[] = [];
  const unclearItems: number[] = [];
  for (const item of [7, 8]) {
    const value = items[item - 1];
    if (value == null) missingItems.push(item);
    else if (instrumentCode === "IBITE-17" && value === 9)
      unclearItems.push(item);
    else if (value >= 1 && value <= maximum) observedItems.push(item);
  }
  return {
    observedItems,
    missingItems,
    unclearItems,
    insufficientInformation: missingItems.length > 0 || unclearItems.length > 0,
  };
}
