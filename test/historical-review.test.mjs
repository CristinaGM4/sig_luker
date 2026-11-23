import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import process from "node:process";
import { test } from "node:test";
import { URL } from "node:url";
import { createDatabaseClient } from "../dist/database/database-client.js";
import {
  recordHistoricalReview,
  registerHistoricalDiagnostic,
} from "../dist/ibite/historical-review.js";

const databaseUrl = process.env.DATABASE_TEST_URL;

test(
  "registra una vez el diagnóstico y conserva revisiones auditadas",
  {
    skip: !databaseUrl && "DATABASE_TEST_URL no está configurada",
  },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");
    const client = createDatabaseClient(databaseUrl);
    context.after(() => client.$disconnect());
    const [operator, reviewer, reviewerRole] = Array.from({ length: 3 }, () =>
      randomUUID(),
    );
    const sourceSha256 = randomBytes(32).toString("hex");
    try {
      const team = await client.role.findUniqueOrThrow({
        where: { code: "PSYCHOSOCIAL_SUPPORT" },
      });
      const permission = await client.permission.findUniqueOrThrow({
        where: { code: "imports:review" },
      });
      await client.$transaction([
        client.role.create({
          data: {
            id: reviewerRole,
            code: "QA-" + reviewerRole,
            label: "Revisor sintético",
            permissions: { create: { permissionId: permission.id } },
          },
        }),
        client.account.create({
          data: { id: operator, roles: { create: { roleId: team.id } } },
        }),
        client.account.create({
          data: { id: reviewer, roles: { create: { roleId: reviewerRole } } },
        }),
      ]);
      const workbook = {
        sourceSha256,
        responseSheet: "Respuestas",
        scoringSheet: "Puntuaciones",
        responses: [
          {
            row: 2,
            timestampValid: true,
            institutionLabel: "Etiqueta sintética reservada",
          },
        ],
        scores: [
          { row: 2, responseRow: 2 },
          { row: 3, responseRow: 99 },
          { row: 4, responseRow: null },
        ],
        aliases: [
          {
            label: "Etiqueta sintética reservada",
            institutionCode: "Candidato reservado",
          },
        ],
      };
      await assert.rejects(
        registerHistoricalDiagnostic(client, reviewer, workbook),
        /Permiso/,
      );
      const [first, repeat] = await Promise.all([
        registerHistoricalDiagnostic(client, operator, workbook),
        registerHistoricalDiagnostic(client, operator, workbook),
      ]);
      assert.deepEqual(first, repeat);
      const diagnostic = await client.historicalDiagnostic.findUniqueOrThrow({
        where: { id: first.id },
      });
      assert.equal(
        JSON.stringify(diagnostic.snapshot).includes("reservad"),
        false,
      );
      const issue = "calculo:4:referencia_no_resuelta";
      await assert.rejects(
        recordHistoricalReview(client, operator, first.id, issue, "observada"),
        /Permiso/,
      );
      await assert.rejects(
        recordHistoricalReview(
          client,
          reviewer,
          first.id,
          "incidencia ajena",
          "observada",
        ),
        /Incidencia/,
      );
      await assert.rejects(
        recordHistoricalReview(client, reviewer, first.id, issue, "publicada"),
        RangeError,
      );
      await recordHistoricalReview(
        client,
        reviewer,
        first.id,
        issue,
        "observada",
      );
      await recordHistoricalReview(
        client,
        reviewer,
        first.id,
        issue,
        "requiere_revision",
      );
      assert.deepEqual(
        (
          await client.historicalReview.findMany({
            where: { diagnosticId: first.id },
            orderBy: { reviewState: "asc" },
          })
        ).map(({ reviewState }) => reviewState),
        ["observada", "requiere_revision"],
      );
      assert.deepEqual(
        (
          await client.auditEvent.findMany({
            where: { targetId: first.id },
            orderBy: { action: "asc" },
          })
        ).map(({ action }) => action),
        [
          "imports.diagnostic.registered",
          "imports.incident.reviewed",
          "imports.incident.reviewed",
        ],
      );
      assert.deepEqual(
        (
          await client.historicalDiagnostic.findUniqueOrThrow({
            where: { id: first.id },
          })
        ).snapshot,
        diagnostic.snapshot,
      );
    } finally {
      await client.$transaction([
        client.auditEvent.deleteMany({
          where: { actorId: { in: [operator, reviewer] } },
        }),
        client.historicalReview.deleteMany({
          where: { diagnostic: { sourceSha256 } },
        }),
        client.historicalDiagnostic.deleteMany({ where: { sourceSha256 } }),
        client.accountRole.deleteMany({
          where: { accountId: { in: [operator, reviewer] } },
        }),
        client.rolePermission.deleteMany({ where: { roleId: reviewerRole } }),
        client.role.deleteMany({ where: { id: reviewerRole } }),
        client.account.deleteMany({
          where: { id: { in: [operator, reviewer] } },
        }),
      ]);
    }
  },
);
