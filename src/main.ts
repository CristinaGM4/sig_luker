import { createApp } from "./app.js";
import { readConfig } from "./config.js";

async function main() {
  const config = readConfig(process.env);
  const app = await createApp(config.swaggerEnabled, process.env.DATABASE_URL);
  try {
    app.enableShutdownHooks();
    await app.listen(config.port, config.host);
  } catch (error) {
    await app.close();
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error de arranque");
  process.exitCode = 1;
});
