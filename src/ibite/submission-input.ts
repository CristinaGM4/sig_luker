const contextKeys = [
  "basicNeeds",
  "housingDamage",
  "injuredHouseholdMember",
  "temporaryDisplacement",
] as const;

type ContextKey = (typeof contextKeys)[number];
export type SubmissionContext = Partial<Record<ContextKey, string | null>>;

export function prepareIbiteAnswers(answers: unknown, context: unknown) {
  if (!Array.isArray(answers))
    throw new RangeError("Respuestas IBITE inválidas");
  const items = Array.from(answers, (item: unknown) => {
    if (item !== null && typeof item !== "string") {
      throw new RangeError("Respuesta IBITE con tipo inválido");
    }
    return item;
  });

  if (
    context === null ||
    typeof context !== "object" ||
    (Object.getPrototypeOf(context) !== Object.prototype &&
      Object.getPrototypeOf(context) !== null)
  ) {
    throw new RangeError("Contexto IBITE inválido");
  }
  if (
    Reflect.ownKeys(context).some(
      (key) => !contextKeys.some((known) => known === key),
    )
  ) {
    throw new RangeError("Campo de contexto IBITE desconocido");
  }
  const input = context as Record<string, unknown>;
  const copiedContext: SubmissionContext = {};
  for (const key of contextKeys) {
    if (!Object.hasOwn(input, key) || input[key] === undefined) continue;
    const value = input[key];
    if (value !== null && typeof value !== "string") {
      throw new RangeError("Contexto IBITE con tipo inválido");
    }
    copiedContext[key] = value;
  }

  return { items, context: copiedContext };
}
