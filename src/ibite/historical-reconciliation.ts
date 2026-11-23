interface ResponseRow {
  row: number;
  timestampValid: boolean;
  institutionLabel: string | null;
  institutionComparisonKey?: string;
}

interface ScoringRow {
  row: number;
  responseRow: number | null;
}

interface InstitutionAlias {
  label: string;
  institutionCode: string;
  comparisonKey?: string;
}

interface HistoricalWorkbook {
  sourceSha256: string;
  responseSheet: string;
  scoringSheet: string;
  responses: readonly ResponseRow[];
  scores: readonly ScoringRow[];
  aliases: readonly InstitutionAlias[];
}

type ResponseIssue =
  | "fecha_ausente_o_invalida"
  | "institucion_ausente"
  | "institucion_sin_alias"
  | "institucion_alias_ortografico"
  | "institucion_ambigua"
  | "sin_calculo"
  | "calculo_repetido";

function aliasKey(label: string) {
  return label.trim().toLowerCase();
}

function comparisonKey(label: string) {
  return label
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function addAlias(map: Map<string, Set<string>>, key: string, code: string) {
  if (!key) return;
  const candidates = map.get(key) ?? new Set<string>();
  candidates.add(code);
  map.set(key, candidates);
}

function validateRow(row: number) {
  if (!Number.isSafeInteger(row) || row < 1 || row > 1_048_576) {
    throw new RangeError("Coordenada de hoja inválida");
  }
}

function registerRow(seen: Set<number>, row: number) {
  validateRow(row);
  if (seen.has(row)) throw new RangeError("Coordenada repetida en la hoja");
  seen.add(row);
}

export function reconcileHistoricalWorkbook(workbook: HistoricalWorkbook) {
  const { responses, scores, aliases, responseSheet, scoringSheet } = workbook;
  if (
    !/^[a-f0-9]{64}$/i.test(workbook.sourceSha256) ||
    !responseSheet.trim() ||
    !scoringSheet.trim() ||
    responseSheet.toLowerCase() === scoringSheet.toLowerCase()
  ) {
    throw new RangeError("Origen histórico inválido");
  }

  const sourceSha256 = workbook.sourceSha256.toLowerCase();
  const responseRows = new Set<number>();
  const scoringRows = new Set<number>();
  const uses = new Map<number, number>();
  const institutionCodes = new Map<string, Set<string>>();
  const normalizedCodes = new Map<string, Set<string>>();

  for (const { row } of responses) registerRow(responseRows, row);
  for (const { row, responseRow } of scores) {
    registerRow(scoringRows, row);
    if (responseRow === null) continue;
    validateRow(responseRow);
    uses.set(responseRow, (uses.get(responseRow) ?? 0) + 1);
  }
  for (const {
    label,
    institutionCode,
    comparisonKey: preparedKey,
  } of aliases) {
    if (!label.trim() || !institutionCode.trim()) {
      throw new RangeError("Alias institucional incompleto");
    }
    addAlias(institutionCodes, aliasKey(label), institutionCode);
    addAlias(
      normalizedCodes,
      preparedKey ?? comparisonKey(label),
      institutionCode,
    );
  }

  const scoringDiagnostics = scores.map(({ row, responseRow }) => ({
    origin: { sourceSha256, sheet: scoringSheet, row },
    responseOrigin:
      responseRow === null
        ? null
        : { sourceSha256, sheet: responseSheet, row: responseRow },
    status:
      responseRow === null
        ? "referencia_no_resuelta"
        : !responseRows.has(responseRow)
          ? "origen_vacio_o_ausente"
          : uses.get(responseRow) === 1
            ? "conciliada"
            : "referencia_repetida",
  }));

  const responseDiagnostics = responses.map(
    ({ row, timestampValid, institutionLabel, institutionComparisonKey }) => {
      const issues: ResponseIssue[] = [];
      const key = aliasKey(institutionLabel ?? "");
      const direct = institutionCodes.get(key);
      const suggestions =
        direct ??
        normalizedCodes.get(
          institutionComparisonKey ?? comparisonKey(institutionLabel ?? ""),
        );
      const candidates = [...(suggestions ?? [])].sort();
      if (!timestampValid) issues.push("fecha_ausente_o_invalida");
      if (!key) issues.push("institucion_ausente");
      else if (candidates.length === 0) issues.push("institucion_sin_alias");
      else if (candidates.length > 1) issues.push("institucion_ambigua");
      else if (!direct) issues.push("institucion_alias_ortografico");
      const count = uses.get(row) ?? 0;
      if (count === 0) issues.push("sin_calculo");
      else if (count > 1) issues.push("calculo_repetido");
      return {
        origin: { sourceSha256, sheet: responseSheet, row },
        status: issues.length ? "en_revision" : "conciliada",
        institutionCandidate: direct?.size === 1 ? candidates[0] : null,
        candidates,
        issues,
      };
    },
  );

  return {
    responses: responseDiagnostics,
    scores: scoringDiagnostics,
    totals: {
      responses: responseDiagnostics.length,
      responsesInReview: responseDiagnostics.filter(
        ({ status }) => status === "en_revision",
      ).length,
      scores: scoringDiagnostics.length,
      scoresWithUnresolvedReference: scoringDiagnostics.filter(
        ({ status }) => status === "referencia_no_resuelta",
      ).length,
      scoresWithoutSource: scoringDiagnostics.filter(
        ({ status }) => status === "origen_vacio_o_ausente",
      ).length,
      scoresWithRepeatedSource: scoringDiagnostics.filter(
        ({ status }) => status === "referencia_repetida",
      ).length,
    },
  };
}
