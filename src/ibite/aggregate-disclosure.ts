interface AggregateCell {
  code: string;
  count: number;
}

/** Evaluates a single, already partitioned synthetic cut. */
export function suppressAggregateCut(
  cells: readonly AggregateCell[],
  minimum: number,
) {
  if (!Number.isSafeInteger(minimum) || minimum < 1) {
    throw new RangeError(
      "El umbral de divulgación debe ser un entero positivo",
    );
  }

  const seen = new Set<string>();
  let total = 0;
  let hasSuppressed = false;
  const items = cells.map(({ code, count }) => {
    if (!/^[A-Z0-9_-]{1,48}$/i.test(code) || seen.has(code)) {
      throw new RangeError("Categoría inválida o duplicada");
    }
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError("Conteo inválido");
    }
    seen.add(code);
    total += count;
    if (!Number.isSafeInteger(total)) {
      throw new RangeError("Total fuera del rango seguro");
    }
    if (count < minimum) {
      hasSuppressed = true;
      return { code, state: "no_disponible", count: null } as const;
    }
    return { code, state: "publicable", count } as const;
  });

  return { items, total: hasSuppressed || items.length === 0 ? null : total };
}
