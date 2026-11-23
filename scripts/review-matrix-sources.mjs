import process from "node:process";
import { reviewMatrixSource } from "../dist/matrix/source-review.js";

function isCoordinate(value, complete) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) =>
      ["fileSha256", "sheet", "row"].includes(key),
    ) &&
    Number.isSafeInteger(value.row) &&
    (value.fileSha256 === undefined
      ? !complete
      : typeof value.fileSha256 === "string") &&
    (value.sheet === undefined ? !complete : typeof value.sheet === "string")
  );
}

async function main() {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 1_000_000)
      throw new Error("Lote de revisión demasiado grande");
  }
  const batch = JSON.parse(input);
  if (
    !batch ||
    Object.keys(batch).length !== 2 ||
    !Array.isArray(batch.references) ||
    !Array.isArray(batch.authorizedCoordinates) ||
    !batch.references.every((row) => isCoordinate(row, false)) ||
    !batch.authorizedCoordinates.every((row) => isCoordinate(row, true))
  ) {
    throw new Error(
      "El lote solo admite referencias y coordenadas documentales",
    );
  }
  const results = batch.references.map((reference, index) => ({
    index: index + 1,
    ...reviewMatrixSource(reference, batch.authorizedCoordinates),
  }));
  process.stdout.write(JSON.stringify(results, null, 2) + "\n");
}

main().catch(() => {
  process.stderr.write(
    "No se pudo revisar el lote de coordenadas de Matriz.\n",
  );
  process.exitCode = 1;
});
