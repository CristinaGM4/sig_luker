import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { test } from "node:test";
import { createApp } from "../dist/app.js";
import { readConfig, readIbiteDemoConfig } from "../dist/config.js";

test("la demo exige una clave estable y una base de prueba local", () => {
  const environment = {
    DATABASE_TEST_URL: "postgresql://127.0.0.1/sig_test",
    IBITE_DEMO_CAPTURE_KEY: "01".repeat(32),
  };
  assert.equal(
    readIbiteDemoConfig(environment).captureKey.toString("hex"),
    environment.IBITE_DEMO_CAPTURE_KEY,
  );
  assert.throws(
    () => readIbiteDemoConfig({ ...environment, IBITE_DEMO_CAPTURE_KEY: "" }),
    /IBITE_DEMO_CAPTURE_KEY/,
  );
  assert.throws(
    () =>
      readIbiteDemoConfig({
        ...environment,
        DATABASE_TEST_URL: "postgresql://127.0.0.1/sig_dev",
      }),
    /sig_test/,
  );
  assert.throws(
    () => readIbiteDemoConfig({ ...environment, HOST: "0.0.0.0" }),
    /127.0.0.1/,
  );
});

test("valida los valores predeterminados y rechaza configuración inválida", () => {
  assert.deepEqual(readConfig({}), {
    host: "127.0.0.1",
    port: 3000,
    swaggerEnabled: false,
  });
  assert.throws(() => readConfig({ PORT: "65536" }), /PORT/);
  assert.throws(() => readConfig({ HOST: "https://example.test" }), /HOST/);
  assert.throws(() => readConfig({ SWAGGER_ENABLED: "1" }), /SWAGGER_ENABLED/);
});

test("el proceso rechaza un puerto inválido al arrancar", () => {
  const result = spawnSync(process.execPath, ["dist/main.js"], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: "0" },
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /PORT/);
});

test("sirve salud y oculta Swagger cuando está desactivado", async (context) => {
  const app = await createApp(false);
  context.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const url = await app.getUrl();
  const health = await fetch(url + "/api/v1/health");
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });
  assert.equal((await fetch(url + "/api/v1/inexistente")).status, 404);
  assert.equal((await fetch(url + "/api/v1/ready")).status, 404);
  assert.equal((await fetch(url + "/docs")).status, 404);
  assert.equal((await fetch(url + "/docs-json")).status, 404);
});

test("publica Swagger y el contrato OpenAPI cuando se habilita", async (context) => {
  const app = await createApp(true);
  context.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const url = await app.getUrl();
  const response = await fetch(url + "/docs-json");
  assert.equal(response.status, 200);
  const document = await response.json();
  assert.match(document.openapi, /^3\./);
  assert.deepEqual(Object.keys(document.paths), ["/api/v1/health"]);
  assert.ok(document.paths["/api/v1/health"].get.responses["200"]);
  assert.equal((await fetch(url + "/docs")).status, 200);
});
