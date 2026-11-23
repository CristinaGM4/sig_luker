import { readFile, stat } from "node:fs/promises";
import process from "node:process";
import { URL } from "node:url";
import { createDatabaseClient } from "../dist/database/database-client.js";
import { importInstitutionPoints } from "../dist/geo/institution-layer-import.js";

async function main() {
  const [path, source, mode, extra] = process.argv.slice(2);
  const plan = mode === "--plan";
  const target = new URL(
    (plan
      ? process.env.SIG_IMPORT_DATABASE_URL
      : process.env.DATABASE_TEST_URL) ?? "",
  );
  if (
    !["postgresql:", "postgres:"].includes(target.protocol) ||
    (!plan &&
      (target.hostname !== "127.0.0.1" || target.pathname !== "/sig_test")) ||
    !path?.toLowerCase().endsWith(".geojson") ||
    !source ||
    (mode !== undefined && !plan) ||
    extra
  )
    throw new Error("Configuración de importación de prueba inválida");
  const file = await stat(path);
  if (!file.isFile() || file.size > 5_000_000)
    throw new Error("Archivo inválido");
  const data = await readFile(path);
  const client = createDatabaseClient(target.href);
  try {
    const report = await importInstitutionPoints(client, data, source, plan);
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    if (!report.ready) process.exitCode = 2;
  } finally {
    await client.$disconnect();
  }
}

main().catch(() => {
  process.stderr.write(
    "Falló la operación. Comprueba el archivo y la URL de la base seleccionada.\n",
  );
  process.exitCode = 1;
});
