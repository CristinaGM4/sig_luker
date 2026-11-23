export type IbiteProfile = 1 | 2 | 3 | 4 | 5;

export const riskByProfile = {
  1: "bajo",
  2: "bajo_medio",
  3: "alto",
  4: "medio_alto",
  5: "medio",
} as const satisfies Record<IbiteProfile, string>;
