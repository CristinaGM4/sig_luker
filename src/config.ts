import { isIP } from "node:net";

export function readIbiteDemoConfig(environment: NodeJS.ProcessEnv) {
  const url = environment.DATABASE_TEST_URL;
  if (!url)
    throw new Error("DATABASE_TEST_URL es requerida para la demo IBITE");
  const target = new URL(url);
  if (
    !["postgresql:", "postgres:"].includes(target.protocol) ||
    target.hostname !== "127.0.0.1" ||
    target.pathname !== "/sig_test"
  ) {
    throw new Error("La demo IBITE requiere PostgreSQL sig_test en 127.0.0.1");
  }
  const secret = environment.IBITE_DEMO_CAPTURE_KEY;
  if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error(
      "IBITE_DEMO_CAPTURE_KEY debe contener 32 bytes en hexadecimal",
    );
  }
  const ephemeralPort = environment.PORT === "0";
  const config = readConfig({
    ...environment,
    PORT: ephemeralPort ? undefined : environment.PORT,
  });
  if (config.host !== "127.0.0.1") {
    throw new Error("La demo IBITE solo escucha en 127.0.0.1");
  }
  return {
    ...config,
    port: ephemeralPort ? 0 : config.port,
    databaseUrl: url,
    captureKey: Buffer.from(secret, "hex"),
  };
}

export function readConfig(environment: NodeJS.ProcessEnv) {
  const host = environment.HOST ?? "127.0.0.1";
  if (!isIP(host) && host !== "localhost") {
    throw new Error("HOST debe ser una dirección IP o localhost");
  }

  const port = environment.PORT ?? "3000";
  if (!/^[0-9]{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535");
  }

  const swaggerEnabled = environment.SWAGGER_ENABLED ?? "false";
  if (swaggerEnabled !== "true" && swaggerEnabled !== "false") {
    throw new Error("SWAGGER_ENABLED debe ser true o false");
  }

  return {
    host,
    port: Number(port),
    swaggerEnabled: swaggerEnabled === "true",
  };
}
