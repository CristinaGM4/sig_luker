import console from "node:console";
import process from "node:process";

try {
  const { reconcileHistoricalWorkbook } =
    await import("../dist/ibite/historical-reconciliation.js");
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const input = JSON.parse(raw);
  const report = reconcileHistoricalWorkbook(input);
  const issuesByCode = {};
  for (const response of report.responses) {
    for (const issue of response.issues) {
      issuesByCode[issue] = (issuesByCode[issue] ?? 0) + 1;
    }
  }

  const bySource = new Map();
  for (const score of report.scores) {
    if (!score.responseOrigin) continue;
    const row = score.responseOrigin.row;
    const entry = bySource.get(row) ?? {
      scoreRows: [],
      sourcePresent: score.status !== "origen_vacio_o_ausente",
    };
    entry.scoreRows.push(score.origin.row);
    bySource.set(row, entry);
  }
  const repeated = [...bySource].filter(
    ([, entry]) => entry.scoreRows.length > 1,
  );
  console.log(
    JSON.stringify(
      {
        sourceSha256: input.sourceSha256,
        extraction: input.extraction,
        totals: report.totals,
        repeatedReferenceCoordinates: {
          count: repeated.length,
          sample: repeated.slice(0, 25).map(([responseRow, entry]) => ({
            responseRow,
            scoreRows: entry.scoreRows.slice(0, 25),
            sourcePresent: entry.sourcePresent,
          })),
        },
        scoresWithRepeatedSourceSample: report.scores
          .filter(({ status }) => status === "referencia_repetida")
          .slice(0, 25)
          .map(({ origin, responseOrigin }) => [
            origin.row,
            responseOrigin.row,
          ]),
        issuesByCode,
        scoresWithoutSourceSample: report.scores
          .filter(({ status }) => status === "origen_vacio_o_ausente")
          .slice(0, 25)
          .map(({ origin, responseOrigin }) => [
            origin.row,
            responseOrigin.row,
          ]),
      },
      null,
      2,
    ),
  );
} catch {
  console.error(
    "No se pudo generar el resumen. Verifica la compilación y el formato de entrada.",
  );
  process.exitCode = 1;
}
