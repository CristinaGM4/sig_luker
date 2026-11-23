import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import process from "node:process";
import { URL } from "node:url";
import { createDatabaseClient } from "../dist/database/database-client.js";
import { importMicrozonification } from "../dist/geo/microzonification.js";

const expectedDigest =
  "6204661d107800659fc3d373efdd2ba3e513f63422c5f53cd590266025ca0804";

async function main() {
  const [path, mode, extra] = process.argv.slice(2);
  const isolated = mode === undefined;
  const target = new URL(
    (isolated
      ? process.env.DATABASE_TEST_URL
      : process.env.SIG_IMPORT_DATABASE_URL) ?? "",
  );
  if (
    !["postgres:", "postgresql:"].includes(target.protocol) ||
    (isolated &&
      (target.hostname !== "127.0.0.1" || target.pathname !== "/sig_test")) ||
    (!isolated && mode !== "--plan" && mode !== "--apply") ||
    !path ||
    extra
  )
    throw new Error("Destino o archivo de prueba inválido");

  const file = await stat(path);
  if (!file.isFile() || file.size > 5_000_000)
    throw new Error("Archivo inválido");
  const data = await readFile(path);
  if (createHash("sha256").update(data).digest("hex") !== expectedDigest)
    throw new Error("La huella difiere del GeoJSON revisado");

  const client = createDatabaseClient(target.href);
  try {
    process.stdout.write(
      JSON.stringify(
        await importMicrozonification(client, data, mode === "--plan"),
      ) + "\n",
    );
  } finally {
    await client.$disconnect();
  }
}

main().catch(() => {
  process.stderr.write(
    "Falló la operación. Comprueba el GeoJSON revisado, las migraciones y la URL de la base seleccionada.\n",
  );
  process.exitCode = 1;
});
