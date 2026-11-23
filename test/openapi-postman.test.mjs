import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { test } from "node:test";
import { URL } from "node:url";
import { createApp } from "../dist/app.js";

const databaseUrl = process.env.DATABASE_TEST_URL;
const collectionPath = new URL(
  "../docs/05-contratos-api/postman/backend.postman_collection.json",
  import.meta.url,
);

test(
  "Postman conserva paridad de rutas y autenticación con OpenAPI",
  {
    skip: !databaseUrl && "DATABASE_TEST_URL no está configurada",
  },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");
    const app = await createApp(true, databaseUrl);
    context.after(() => app.close());
    await app.listen(0, "127.0.0.1");
    const response = await fetch((await app.getUrl()) + "/docs-json");
    assert.equal(response.status, 200);
    const document = await response.json();
    assert.equal(
      document.paths[
        "/api/v1/mis-aplicaciones-ibite/{habilitacionId}/negativa"
      ],
      undefined,
    );
    assert.equal(
      document.paths[
        "/api/v1/mis-aplicaciones-ibite/{habilitacionId}/formulario"
      ],
      undefined,
    );
    assert.equal(
      document.paths["/api/v1/mis-aplicaciones-ibite/{habilitacionId}/envios"],
      undefined,
    );
    const collection = JSON.parse(await readFile(collectionPath, "utf8"));
    const operations = [];
    for (const [path, methods] of Object.entries(document.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (
          ![
            "get",
            "post",
            "put",
            "patch",
            "delete",
            "head",
            "options",
          ].includes(method)
        )
          continue;
        operations.push(
          method.toUpperCase() +
            " " +
            path +
            ":" +
            (operation.security?.some((scheme) =>
              Object.hasOwn(scheme, "bearer"),
            )
              ? "bearer"
              : "public"),
        );
      }
    }
    const requests = collection.item.map(({ request }) => {
      assert.ok(request.url.startsWith("{{baseUrl}}/api/v1/"));
      const path = request.url
        .replace("{{baseUrl}}", "")
        .split("?")[0]
        .replace(/\{\{([^}]+)\}\}/g, "{$1}");
      return (
        request.method + " " + path + ":" + (request.auth?.type ?? "public")
      );
    });
    assert.deepEqual(requests.sort(), operations.sort());
  },
);
