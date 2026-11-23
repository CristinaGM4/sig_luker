interface SourceCoordinate {
  fileSha256: string;
  sheet: string;
  row: number;
}

interface MatrixSourceReference {
  fileSha256?: string;
  sheet?: string;
  row: number;
}

function validRow(row: number) {
  return Number.isSafeInteger(row) && row > 1;
}

function validSource(fileSha256: string, sheet: string) {
  return /^[0-9a-f]{64}$/i.test(fileSha256) && sheet.trim().length > 0;
}

export function reviewMatrixSource(
  reference: MatrixSourceReference,
  authorizedCoordinates: readonly SourceCoordinate[],
) {
  if (!validRow(reference.row)) return { state: "invalid" } as const;
  if (!reference.fileSha256 || !reference.sheet)
    return { state: "missing_provenance" } as const;
  if (!validSource(reference.fileSha256, reference.sheet))
    return { state: "invalid" } as const;
  const normalized = {
    ...reference,
    fileSha256: reference.fileSha256.toLowerCase(),
    sheet: reference.sheet,
  };
  const matches = authorizedCoordinates.filter(
    ({ fileSha256, sheet, row }) =>
      fileSha256.toLowerCase() === normalized.fileSha256 &&
      sheet === normalized.sheet &&
      row === normalized.row,
  );
  if (matches.length > 1) return { state: "ambiguous" } as const;
  if (matches.length === 0) return { state: "not_found" } as const;
  return { state: "located", coordinate: normalized } as const;
}
