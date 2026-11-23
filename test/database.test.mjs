import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { test } from "node:test";
import { URL } from "node:url";
import { createApp } from "../dist/app.js";
import { SessionGuard } from "../dist/auth/session.guard.js";
import { SessionService } from "../dist/auth/session.service.js";
import { seedAccessCatalog } from "../dist/database/access-catalog.js";
import { seedInstrumentCatalog } from "../dist/database/instrument-catalog.js";
import { DatabaseService } from "../dist/database/database.module.js";
import { calculateIbiteReference } from "../dist/ibite/reference-calculation.js";

const databaseUrl = process.env.DATABASE_TEST_URL;

test(
  "conecta Nest a PostgreSQL y repite la semilla de permisos",
  { skip: !databaseUrl && "DATABASE_TEST_URL no está configurada" },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");

    const app = await createApp(false, databaseUrl);
    context.after(() => app.close());
    await app.listen(0, "127.0.0.1");

    const { client } = app.get(DatabaseService);
    const accountsBefore = await client.account.count();
    await seedAccessCatalog(client);
    const readCatalog = () =>
      client.role.findMany({
        orderBy: { code: "asc" },
        include: {
          permissions: {
            orderBy: { permission: { code: "asc" } },
            include: { permission: true },
          },
        },
      });
    const first = await readCatalog();
    await seedAccessCatalog(client);
    assert.deepEqual(await readCatalog(), first);
    assert.equal(await client.account.count(), accountsBefore);
    assert.deepEqual(
      first.map(({ code }) => code),
      [
        "ADMINISTRATIVE",
        "CAREGIVER",
        "COUNSELOR",
        "PSYCHOSOCIAL_SUPPORT",
        "SCHOOL_LEADERSHIP",
        "STUDENT",
        "TEACHER",
      ],
    );
    assert.equal(await client.permission.count(), 13);
    assert.equal(await client.rolePermission.count(), 15);

    for (const role of first) {
      const permissions = role.permissions.map(
        ({ permission }) => permission.code,
      );
      if (role.code === "PSYCHOSOCIAL_SUPPORT") {
        assert.deepEqual(permissions, [
          "audit:read",
          "exports:execute",
          "imports:execute",
          "records:approve",
          "records:create",
          "records:delete",
          "records:read",
          "records:read-identity",
          "records:update",
        ]);
      } else {
        assert.deepEqual(permissions, ["ibite:complete"]);
      }
    }

    const response = await fetch((await app.getUrl()) + "/api/v1/health");
    assert.equal(response.status, 200);
  },
);

test(
  "autentica sesiones y aplica permisos vigentes",
  { skip: !databaseUrl && "DATABASE_TEST_URL no está configurada" },
  async () => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");

    const app = await createApp(true, databaseUrl);
    try {
      await app.listen(0, "127.0.0.1");
      const { client } = app.get(DatabaseService);
      const student = await client.role.findUniqueOrThrow({
        where: { code: "STUDENT" },
      });
      const account = await client.account.create({
        data: { roles: { create: { roleId: student.id } } },
      });
      try {
        const service = app.get(SessionService);
        const future = new Date(Date.now() + 60_000);
        await assert.rejects(
          service.issue(account.id, new Date(0)),
          RangeError,
        );
        const { token } = await service.issue(account.id, future);
        const second = await service.issue(account.id, future);
        assert.notEqual(token, second.token);
        const tokenDigest = createHash("sha256").update(token).digest("hex");
        assert.deepEqual(
          await client.authSession.findUniqueOrThrow({
            where: { tokenDigest },
          }),
          {
            tokenDigest,
            accountId: account.id,
            expiresAt: future,
            revokedAt: null,
          },
        );

        const url = await app.getUrl();
        const identity = (authorization) =>
          fetch(url + "/api/v1/auth/me", {
            headers: authorization ? { authorization } : {},
          });
        assert.equal((await identity()).status, 401);
        assert.equal((await identity("Bearer incorrecto")).status, 401);
        assert.equal(
          (await identity("Bearer " + randomBytes(32).toString("base64url")))
            .status,
          401,
        );
        const response = await identity("Bearer " + token);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "no-store");
        assert.deepEqual(await response.json(), {
          accountId: account.id,
          roles: ["STUDENT"],
          permissions: ["ibite:complete"],
        });

        const guard = app.get(SessionGuard);
        const request = { headers: { authorization: "Bearer " + token } };
        const handler = () => {};
        const controller = class {};
        const executionContext = {
          getHandler: () => handler,
          getClass: () => controller,
          switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => ({ setHeader() {} }),
          }),
        };
        const { RequiresPermissions } =
          await import("../dist/auth/session.guard.js");
        RequiresPermissions(["ibite:complete"])(controller);
        assert.equal(await guard.canActivate(executionContext), true);
        RequiresPermissions(["records:read"])(handler);
        await assert.rejects(
          guard.canActivate(executionContext),
          (error) => error.getStatus() === 403,
        );

        const document = await (await fetch(url + "/docs-json")).json();
        assert.deepEqual(document.paths["/api/v1/auth/me"].get.security, [
          { bearer: [] },
        ]);

        await client.authSession.update({
          where: { tokenDigest },
          data: { expiresAt: new Date(0) },
        });
        assert.equal((await identity("Bearer " + token)).status, 401);
        await client.authSession.update({
          where: { tokenDigest },
          data: { expiresAt: future, revokedAt: new Date() },
        });
        assert.equal((await identity("Bearer " + token)).status, 401);
        await client.authSession.update({
          where: { tokenDigest },
          data: { revokedAt: null },
        });
        const logout = () =>
          fetch(url + "/api/v1/auth/session", {
            method: "DELETE",
            headers: { authorization: "Bearer " + token },
          });
        const closed = await logout();
        assert.equal(closed.status, 204);
        assert.equal(await closed.text(), "");
        assert.equal((await identity("Bearer " + token)).status, 401);
        assert.equal((await logout()).status, 401);
        assert.equal((await identity("Bearer " + second.token)).status, 200);

        await client.account.update({
          where: { id: account.id },
          data: { active: false },
        });
        assert.equal((await identity("Bearer " + second.token)).status, 401);
        await assert.rejects(
          service.issue(account.id, future),
          (error) => error.getStatus() === 401,
        );
      } finally {
        await client.$transaction([
          client.authSession.deleteMany({ where: { accountId: account.id } }),
          client.accountRole.deleteMany({ where: { accountId: account.id } }),
          client.account.delete({ where: { id: account.id } }),
        ]);
      }
    } finally {
      await app.close();
    }
  },
);

test(
  "consulta catálogos internos con el permiso vigente y paginación",
  { skip: !databaseUrl && "DATABASE_TEST_URL no está configurada" },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");

    const app = await createApp(true, databaseUrl);
    context.after(() => app.close());
    await app.listen(0, "127.0.0.1");
    const { client } = app.get(DatabaseService);
    const sessions = app.get(SessionService);
    const fixture = "QA-" + randomBytes(8).toString("hex");
    const accountIds = [];
    try {
      const institutions = await client.institution.createManyAndReturn({
        data: [
          { code: fixture + "-1", name: "Institución sintética 1" },
          {
            code: fixture + "-2",
            name: "Institución sintética 2",
            active: false,
          },
        ],
      });
      const period = await client.academicPeriod.create({
        data: {
          code: fixture + "-1",
          label: "Periodo sintético",
          startsOn: new Date("2026-01-01"),
          endsOn: new Date("2026-06-30"),
        },
      });

      async function createTestSession(roleCode) {
        const role = await client.role.findUniqueOrThrow({
          where: { code: roleCode },
        });
        const account = await client.account.create({
          data: { roles: { create: { roleId: role.id } } },
        });
        accountIds.push(account.id);
        return sessions.issue(account.id, new Date(Date.now() + 60_000));
      }

      const team = await createTestSession("PSYCHOSOCIAL_SUPPORT");
      const student = await createTestSession("STUDENT");
      const base = (await app.getUrl()) + "/api/v1/interno/catalogos";
      const read = (path, session) =>
        fetch(base + path, {
          headers: session ? { authorization: "Bearer " + session.token } : {},
        });

      assert.equal((await read("/instituciones")).status, 401);
      assert.equal((await read("/instituciones", student)).status, 403);
      assert.equal((await read("/periodos", student)).status, 403);
      for (const query of [
        "limit=0",
        "limit=101",
        "limit=1&limit=2",
        "extra=1",
        "after=",
      ]) {
        assert.equal((await read("/instituciones?" + query, team)).status, 400);
      }

      const start = encodeURIComponent(fixture + "-0");
      const firstResponse = await read(
        "/instituciones?limit=1&after=" + start,
        team,
      );
      assert.equal(firstResponse.status, 200);
      const first = await firstResponse.json();
      assert.deepEqual(first, {
        items: [institutions[0]],
        nextCursor: fixture + "-1",
      });
      const second = await (
        await read(
          "/instituciones?limit=1&after=" +
            encodeURIComponent(first.nextCursor),
          team,
        )
      ).json();
      assert.deepEqual(second.items, [institutions[1]]);

      const periods = await (
        await read("/periodos?limit=1&after=" + start, team)
      ).json();
      assert.deepEqual(periods.items, [
        { ...period, startsOn: "2026-01-01", endsOn: "2026-06-30" },
      ]);
      const spec = await (
        await fetch((await app.getUrl()) + "/docs-json")
      ).json();
      assert.ok(
        spec.paths["/api/v1/interno/catalogos/instituciones"].get.responses[
          "403"
        ],
      );
    } finally {
      await client.$transaction([
        client.authSession.deleteMany({
          where: { accountId: { in: accountIds } },
        }),
        client.accountRole.deleteMany({
          where: { accountId: { in: accountIds } },
        }),
        client.account.deleteMany({ where: { id: { in: accountIds } } }),
        client.institution.deleteMany({
          where: { code: { in: [fixture + "-1", fixture + "-2"] } },
        }),
        client.academicPeriod.deleteMany({ where: { code: fixture + "-1" } }),
      ]);
    }
  },
);

test(
  "comprueba disponibilidad de PostgreSQL sin filtrar errores",
  { skip: !databaseUrl && "DATABASE_TEST_URL no está configurada" },
  async (context) => {
    const app = await createApp(true, databaseUrl);
    context.after(() => app.close());
    await app.listen(0, "127.0.0.1");
    const url = await app.getUrl();
    const ready = await fetch(url + "/api/v1/ready");
    assert.equal(ready.status, 200);
    assert.equal(ready.headers.get("cache-control"), "no-store");
    assert.deepEqual(await ready.json(), { status: "ready" });

    context.mock.method(
      app.get(DatabaseService),
      "verifyConnection",
      async () => {
        throw new Error("Detalle sintético de PostgreSQL");
      },
    );
    const unavailable = await fetch(url + "/api/v1/ready");
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { status: "unavailable" });
    assert.equal((await fetch(url + "/api/v1/health")).status, 200);
    const spec = await (await fetch(url + "/docs-json")).json();
    assert.ok(spec.paths["/api/v1/ready"].get.responses["200"]);
    assert.ok(spec.paths["/api/v1/ready"].get.responses["503"]);
  },
);

test(
  "conserva la identidad y procedencia de las versiones de instrumentos",
  { skip: !databaseUrl && "DATABASE_TEST_URL no está configurada" },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");
    const app = await createApp(false, databaseUrl);
    context.after(() => app.close());
    await app.init();
    const { client } = app.get(DatabaseService);

    const readCatalog = () =>
      client.instrumentVersion.findMany({
        orderBy: [{ instrumentCode: "asc" }, { variant: "asc" }],
      });
    await client.$transaction(seedInstrumentCatalog);
    const first = await readCatalog();
    await client.$transaction(seedInstrumentCatalog);
    assert.deepEqual(await readCatalog(), first);
    assert.equal(await client.instrument.count(), 2);
    assert.deepEqual(
      first.map(({ instrumentCode, variant, itemCount }) => [
        instrumentCode,
        variant,
        itemCount,
      ]),
      [
        ["IBITE-17", "ADOLESCENT", 17],
        ["IBITE-17", "CAREGIVER", 17],
        ["IBITE-DA-28", "EDUCATIONAL_STAFF", 28],
      ],
    );
    for (const entry of first)
      assert.match(entry.sourceSha256, /^[0-9a-f]{64}$/);

    const [adolescent, caregiver, staff] = first;
    const evidence = JSON.parse(
      await readFile(
        new URL(
          "../docs/06-reglas-negocio/ibite17-formularios-evidencia.v2.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(evidence.status, "reference-reviewed");
    assert.match(evidence.screenshots.sha256, /^[a-f0-9]{64}$/);
    assert.equal(evidence.variants.length, 2);
    const scoring = "R S T U V W X Y Z AA AB AC AD AE AF AG AH".split(" ");
    for (const [version, inputColumns, consentColumns] of [
      [caregiver, "T U V W X Y Z AA AB AC AD AE AF AG AH AI AJ", ["C"]],
      [
        adolescent,
        "BC BD BE BF BG BH BI BJ BK BL BM BN BO BP BQ BR BS",
        ["AK", "AL"],
      ],
    ]) {
      const variantEvidence = evidence.variants.find(
        ({ variant }) => variant === version.variant,
      );
      assert.equal(version.instrumentCode, evidence.instrumentCode);
      assert.equal(version.sourceVersion, evidence.sourceVersion);
      assert.equal(version.sourceSha256, evidence.workbook.sha256);
      assert.deepEqual(
        variantEvidence.consent.map(({ column }) => column),
        consentColumns,
      );
      assert.equal(variantEvidence.scoredItems.length, version.itemCount);
      assert.deepEqual(
        variantEvidence.scoredItems.map(({ column }) => column),
        inputColumns.split(" "),
      );
      assert.deepEqual(
        variantEvidence.scoredItems.map(({ scoringColumn }) => scoringColumn),
        scoring,
      );
      assert.equal(
        new Set(variantEvidence.scoredItems.map(({ id }) => id)).size,
        version.itemCount,
      );
    }
    const juvenileAnswers = Array(17).fill("Nunca");
    const staffAnswers = Array(28).fill("Nada");
    const adult = calculateIbiteReference(staff, staffAnswers, {
      present: true,
    });
    assert.deepEqual(adult.reference, staff);
    assert.equal(adult.classification.profile, 3);
    assert.equal(adult.orientation.recommendationKey, "3");
    assert.equal(
      calculateIbiteReference(adolescent, juvenileAnswers, { present: true })
        .orientation.recommendationKey,
      "4-B",
    );
    assert.equal(
      calculateIbiteReference(caregiver, juvenileAnswers, { present: true })
        .orientation.recommendationKey,
      "4-A",
    );
    assert.throws(
      () =>
        calculateIbiteReference(
          { ...staff, ruleVersion: caregiver.ruleVersion },
          staffAnswers,
          { present: true },
        ),
      RangeError,
    );
    assert.throws(
      () =>
        calculateIbiteReference(
          { ...caregiver, variant: staff.variant },
          juvenileAnswers,
          { present: true },
        ),
      RangeError,
    );

    const entry = first[0];
    const rollback = new Error("Revertir modificación sintética");
    await assert.rejects(
      client.$transaction(async (tx) => {
        await tx.instrumentVersion.update({
          where: {
            instrumentCode_variant_sourceVersion: {
              instrumentCode: entry.instrumentCode,
              variant: entry.variant,
              sourceVersion: entry.sourceVersion,
            },
          },
          data: { itemCount: 18 },
        });
        await assert.rejects(seedInstrumentCatalog(tx), /metadatos/);
        throw rollback;
      }),
      (error) => error === rollback,
    );
    assert.deepEqual(await readCatalog(), first);

    await assert.rejects(
      client.instrumentVersion.create({
        data: { ...entry, sourceVersion: "qa-item-count", itemCount: 0 },
      }),
    );
    assert.deepEqual(await readCatalog(), first);
  },
);
