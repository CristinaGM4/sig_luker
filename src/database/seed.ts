import { seedAccessCatalog } from "./access-catalog.js";
import { createDatabaseClient } from "./database-client.js";
import { seedInstrumentCatalog } from "./instrument-catalog.js";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Configura DATABASE_URL para cargar el catálogo");
  }

  const client = createDatabaseClient(databaseUrl);
  try {
    await seedAccessCatalog(client);
    await client.$transaction(seedInstrumentCatalog);
    console.log("Catálogos iniciales actualizados");
  } catch {
    throw new Error("No se pudieron cargar los catálogos iniciales");
  } finally {
    await client.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error de carga");
  process.exitCode = 1;
});
