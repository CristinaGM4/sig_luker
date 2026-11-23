import { replayIbiteApplication } from "../dist/ibite/application-replay.js";
import { persistValidatedSubmission } from "../dist/ibite/application-persistence.js";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { test } from "node:test";
import { URL } from "node:url";
import { createApp } from "../dist/app.js";
import { Buffer } from "node:buffer";
import { importInstitutionPoints } from "../dist/geo/institution-layer-import.js";
import { availableIbiteAssignments } from "../dist/ibite/available-assignments.js";
import { SessionService } from "../dist/auth/session.service.js";
import { DatabaseService } from "../dist/database/database.module.js";
import { observeIbiteSafety } from "../dist/ibite/safety-observations.js";
import { countReportedRepresentativeAuthorization } from "../dist/ibite/representative-authorization.js";
import {
  caregiverForm,
  syntheticIbiteForm,
} from "./fixtures/ibite-synthetic-form.mjs";

test("conserva observaciones positivas junto con información insuficiente", () => {
  const items = Array(17).fill(0);
  items[6] = 1;
  items[7] = null;
  for (const code of ["IBITE-17", "IBITE-DA-28"]) {
    assert.deepEqual(observeIbiteSafety(items, code), {
      observedItems: [7],
      missingItems: [8],
      unclearItems: [],
      insufficientInformation: true,
    });
  }
  items[7] = 9;
  assert.deepEqual(observeIbiteSafety(items, "IBITE-17").unclearItems, [8]);
});

const databaseUrl = process.env.DATABASE_TEST_URL;

test(
  "consulta resultados solo con rol y asignación institucional explícitos",
  {
    skip: !databaseUrl && "DATABASE_TEST_URL no está configurada",
  },
  async (context) => {
    const target = new URL(databaseUrl);
    assert.equal(target.hostname, "127.0.0.1");
    assert.equal(target.pathname, "/sig_test");

    const captureKey = randomBytes(32);
    const boot = () =>
      createApp(
        true,
        databaseUrl,
        [syntheticIbiteForm, caregiverForm],
        captureKey,
      );
    let app = await boot();
    context.after(() => app.close());
    await app.listen(0, "127.0.0.1");
    let { client } = app.get(DatabaseService);
    const sessions = app.get(SessionService);
    const code = "QA-" + randomUUID();
    const ids = Array.from({ length: 8 }, () => randomUUID());
    const [
      teamId,
      technicalId,
      institutionId,
      periodId,
      participantId,
      technicalRoleId,
      respondentId,
      otherRespondentId,
    ] = ids;
    const alternateInstitutionId = randomUUID();
    const refusalParticipantId = randomUUID();
    const demoParticipantIds = [randomUUID(), randomUUID()];
    const fixtureParticipantIds = [
      participantId,
      refusalParticipantId,
      ...demoParticipantIds,
    ];
    const selfStudentId = randomUUID();
    const fixtureAccountIds = [
      teamId,
      technicalId,
      respondentId,
      otherRespondentId,
      selfStudentId,
    ];
    let applicationId;
    try {
      const version = await client.instrumentVersion.findFirstOrThrow({
        where: { instrumentCode: "IBITE-17", variant: "ADOLESCENT" },
      });
      const role = await client.role.findUniqueOrThrow({
        where: { code: "PSYCHOSOCIAL_SUPPORT" },
      });
      const permission = await client.permission.findUniqueOrThrow({
        where: { code: "records:read" },
      });
      const auditPermission = await client.permission.findUniqueOrThrow({
        where: { code: "audit:read" },
      });
      const manage = await client.permission.findUniqueOrThrow({
        where: { code: "scope:manage" },
      });
      const campaignControl = await client.permission.findUniqueOrThrow({
        where: { code: "ibite:campaign-control" },
      });
      await client.$transaction([
        client.account.create({
          data: { id: teamId, roles: { create: { roleId: role.id } } },
        }),
        client.role.create({
          data: {
            id: technicalRoleId,
            code,
            label: "Rol técnico sintético",
            permissions: {
              create: [
                { permissionId: permission.id },
                { permissionId: manage.id },
                { permissionId: campaignControl.id },
                { permissionId: auditPermission.id },
              ],
            },
          },
        }),
        client.account.create({
          data: {
            id: technicalId,
            roles: { create: { roleId: technicalRoleId } },
          },
        }),
        client.institution.create({
          data: { id: institutionId, code, name: "Institución sintética" },
        }),
        client.academicPeriod.create({
          data: {
            id: periodId,
            code,
            label: "Periodo sintético",
            startsOn: new Date("2026-01-01"),
            endsOn: new Date("2026-06-30"),
          },
        }),
        client.participant.create({ data: { id: participantId } }),
        client.accountInstitution.create({
          data: { accountId: teamId, institutionId },
        }),
      ]);
      const student = await client.role.findUniqueOrThrow({
        where: { code: "STUDENT" },
      });
      await client.account.create({
        data: { id: respondentId, roles: { create: { roleId: student.id } } },
      });
      const campaign = await client.ibiteCampaign.create({
        data: {
          institutionId,
          periodId,
          instrumentCode: version.instrumentCode,
          variant: version.variant,
          sourceVersion: version.sourceVersion,
          opensAt: new Date(Date.now() - 60_000),
          closesAt: new Date(Date.now() + 60_000),
        },
      });
      const assignment = await client.ibiteAssignment.create({
        data: { campaignId: campaign.id, participantId, respondentId },
      });
      const pilot = JSON.parse(
        await readFile(
          new URL(
            "../docs/02-requerimientos/ibite17-piloto-periodo-2.json",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      assert.equal(pilot.periodLabel, "Periodo 2");
      assert.equal(new Set(pilot.institutions).size, 10);
      await client.ibiteCampaign.update({
        where: { id: campaign.id },
        data: {
          opensAt: new Date(pilot.opensAt),
          closesAt: new Date(pilot.closesAtExclusive),
        },
      });
      for (const [instant, expected] of [
        ["2026-11-24T23:59:59-05:00", 0],
        ["2026-11-25T00:00:00-05:00", 1],
        ["2026-12-10T23:59:59-05:00", 1],
        ["2026-12-11T00:00:00-05:00", 0],
      ]) {
        assert.equal(
          await client.ibiteAssignment.count({
            where: {
              id: assignment.id,
              ...availableIbiteAssignments(respondentId, new Date(instant)),
            },
          }),
          expected,
        );
      }
      await client.ibiteCampaign.update({
        where: { id: campaign.id },
        data: { opensAt: campaign.opensAt, closesAt: campaign.closesAt },
      });
      await client.account.create({
        data: {
          id: otherRespondentId,
          roles: { create: { roleId: student.id } },
        },
      });
      const other = await sessions.issue(
        otherRespondentId,
        new Date(Date.now() + 60_000),
      );
      const respondent = await sessions.issue(
        respondentId,
        new Date(Date.now() + 60_000),
      );
      let baseAssignments =
        (await app.getUrl()) + "/api/v1/mis-aplicaciones-ibite";
      const list = (query = "") =>
        fetch(baseAssignments + query, {
          headers: { authorization: "Bearer " + respondent.token },
        });
      const unauthenticated = await fetch(baseAssignments);
      assert.equal(unauthenticated.status, 401);
      assert.equal(unauthenticated.headers.get("www-authenticate"), "Bearer");
      assert.equal(unauthenticated.headers.get("cache-control"), "no-store");
      const detailPath = "/" + assignment.id;
      const receiptPath = detailPath + "/acuse";
      const formPath = detailPath + "/formulario";
      const submitPath = detailPath + "/envios";
      const readOther = (path) =>
        fetch(baseAssignments + path, {
          headers: { authorization: "Bearer " + other.token },
        });
      assert.deepEqual(await (await readOther("")).json(), {
        items: [],
        nextCursor: null,
      });
      assert.equal((await readOther(detailPath)).status, 404);
      assert.equal((await list(receiptPath)).status, 404);
      assert.equal((await list("/" + randomUUID())).status, 404);
      assert.equal((await list("/invalid")).status, 400);
      assert.equal((await list("?after=bad")).status, 400);
      const visible = await list();
      assert.equal(visible.status, 200);
      assert.equal(visible.headers.get("cache-control"), "no-store");
      const listed = await visible.json();
      assert.deepEqual(listed, {
        items: [
          {
            id: assignment.id,
            campaignId: campaign.id,
            institutionCode: code,
            periodCode: code,
            instrumentCode: version.instrumentCode,
            variant: version.variant,
            sourceVersion: version.sourceVersion,
            opensAt: campaign.opensAt.toISOString(),
            closesAt: campaign.closesAt.toISOString(),
            submitted: false,
          },
        ],
        nextCursor: null,
      });
      assert.deepEqual(await (await list("?after=" + assignment.id)).json(), {
        items: [],
        nextCursor: null,
      });

      assert.deepEqual(await (await list(detailPath)).json(), listed.items[0]);
      assert.equal((await readOther(formPath)).status, 404);
      const formResponse = await list(formPath);
      assert.equal(formResponse.status, 200);
      assert.equal(formResponse.headers.get("cache-control"), "no-store");
      const form = await formResponse.json();
      assert.equal(form.questions.length, 17);
      assert.equal(form.questions[0].options[0].sourceValue, undefined);
      const submission = {
        idempotencyKey: randomUUID(),
        assignmentId: assignment.id,
        authenticatedAccountId: respondentId,
        answers: syntheticIbiteForm.questions.map(
          ({ options }, index) =>
            options[index === 6 ? 1 : index === 7 ? 4 : 0].sourceValue,
        ),
        context: {},
        reportedRepresentativeAuthorization: "unknown",
        acceptedFormVersion: form.formVersion,
      };
      const answerBody = {
        formVersion: form.formVersion,
        participation: "accepted",
        reportedRepresentativeAuthorization: "unknown",
        answers: form.questions.map(({ id, options }, index) => ({
          questionId: id,
          optionId: options[index === 6 ? 1 : index === 7 ? 4 : 0].id,
        })),
      };
      const collection = JSON.parse(
        await readFile(
          new URL(
            "../docs/05-contratos-api/postman/ibite-captura-sintetica.postman_collection.json",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      const [getRequest, postRequest, declineRequest] = collection.item.map(
        ({ request }) => request,
      );
      assert.equal(getRequest.method, "GET");
      assert.equal(postRequest.method, "POST");
      assert.deepEqual(JSON.parse(postRequest.body.raw), answerBody);
      assert.ok(
        postRequest.header.some(({ key }) => key === "Idempotency-Key"),
      );
      const post = (
        body = answerBody,
        token = respondent.token,
        key = submission.idempotencyKey,
      ) =>
        fetch(baseAssignments + submitPath, {
          method: "POST",
          headers: {
            authorization: "Bearer " + token,
            "content-type": "application/json",
            "Idempotency-Key": key,
          },
          body: JSON.stringify(body),
        });
      assert.equal((await post(answerBody, other.token)).status, 404);
      assert.equal(
        (await post(answerBody, respondent.token, "corta")).status,
        400,
      );
      assert.equal((await post({ ...answerBody, institutionId })).status, 400);
      assert.equal(
        (await post({ ...answerBody, formVersion: "anterior" })).status,
        409,
      );
      assert.equal(
        (await post({ ...answerBody, participation: "declined" })).status,
        422,
      );
      assert.equal(
        (
          await post({
            ...answerBody,
            answers: [...answerBody.answers.slice(1), answerBody.answers[1]],
          })
        ).status,
        422,
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          authenticatedAccountId: technicalId,
        }),
        /Habilitación/,
      );
      await client.ibiteAssignment.update({
        where: { id: assignment.id },
        data: { revokedAt: new Date() },
      });
      assert.deepEqual((await (await list()).json()).items, []);
      assert.equal((await post()).status, 404);
      await assert.rejects(
        persistValidatedSubmission(client, submission),
        /Habilitación/,
      );
      await client.ibiteAssignment.update({
        where: { id: assignment.id },
        data: { revokedAt: null },
      });
      await client.ibiteCampaign.update({
        where: { id: campaign.id },
        data: { closesAt: new Date(Date.now() - 10_000) },
      });
      assert.equal((await list(formPath)).status, 404);
      assert.equal((await post()).status, 404);
      await assert.rejects(
        persistValidatedSubmission(client, submission),
        /Habilitación/,
      );
      await client.ibiteCampaign.update({
        where: { id: campaign.id },
        data: { closesAt: new Date(Date.now() + 60_000) },
      });
      await client.accountRole.delete({
        where: {
          accountId_roleId: { accountId: respondentId, roleId: student.id },
        },
      });
      await assert.rejects(
        persistValidatedSubmission(client, submission),
        /Habilitación/,
      );
      await client.accountRole.create({
        data: { accountId: respondentId, roleId: student.id },
      });
      assert.equal(
        await client.ibiteApplication.count({ where: { participantId } }),
        0,
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          idempotencyKey: "corta",
        }),
        RangeError,
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          idempotencyKey: 1234567890123456,
        }),
        /Clave de reintento inválida/,
      );
      const [acceptedResponse, retryResponse] = await Promise.all([
        post(),
        post({ ...answerBody, answers: [...answerBody.answers].reverse() }),
      ]);
      assert.equal(acceptedResponse.status, 201);
      assert.equal(retryResponse.status, 201);
      const accepted = await acceptedResponse.json();
      const retry = await retryResponse.json();
      applicationId = accepted.applicationId;
      assert.deepEqual(retry, accepted);
      assert.equal(
        (
          await post({
            ...answerBody,
            reportedRepresentativeAuthorization: "authorized",
          })
        ).status,
        409,
      );
      assert.equal(
        (await post(answerBody, respondent.token, randomUUID())).status,
        409,
      );
      assert.equal((await (await list()).json()).items[0].submitted, true);
      const stored = await client.ibiteApplication.findUniqueOrThrow({
        where: { id: applicationId },
      });
      assert.equal(stored.assignmentId, assignment.id);
      assert.equal(stored.respondentId, respondentId);
      assert.equal(stored.participantId, participantId);
      assert.equal(stored.originalResponses.formVersion, form.formVersion);
      assert.equal(stored.originalResponses.participation, "accepted");
      assert.equal(
        stored.originalResponses.reportedRepresentativeAuthorization,
        "unknown",
      );
      assert.deepEqual(
        countReportedRepresentativeAuthorization([
          stored.originalResponses.reportedRepresentativeAuthorization,
        ]),
        { authorized: 0, unknown: 1, missing: 0 },
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          reportedRepresentativeAuthorization: "authorized",
        }),
        /otro contenido/,
      );
      assert.notEqual(stored.idempotencyKeyDigest, submission.idempotencyKey);
      assert.equal(
        await client.ibiteApplication.count({ where: { participantId } }),
        1,
      );
      assert.equal(
        await client.ibiteResult.count({ where: { applicationId } }),
        1,
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          answers: Array(17).fill("Varios días"),
        }),
        /otro contenido/,
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          idempotencyKey: randomUUID(),
        }),
        (error) => error.code === "P2002",
      );
      assert.equal((await readOther(receiptPath)).status, 404);
      const receipt = await list(receiptPath);
      assert.equal(receipt.status, 200);
      assert.deepEqual(await receipt.json(), {
        applicationId,
        assignmentId: assignment.id,
        sourceVersion: version.sourceVersion,
        submittedAt: stored.appliedAt.toISOString(),
      });
      await client.ibiteAssignment.update({
        where: { id: assignment.id },
        data: { revokedAt: new Date() },
      });
      assert.equal((await list(receiptPath)).status, 404);
      await assert.rejects(
        persistValidatedSubmission(client, submission),
        /Habilitación/,
      );
      await client.ibiteAssignment.update({
        where: { id: assignment.id },
        data: { revokedAt: null },
      });
      await client.ibiteResult.createMany({
        data: [
          {
            applicationId,
            ruleVersion: version.ruleVersion,
            provenance: { type: "synthetic" },
            result: { complete: false },
          },
          {
            applicationId,
            ruleVersion: version.ruleVersion,
            provenance: { type: "synthetic-replay" },
            result: { complete: false },
          },
        ],
      });
      const team = await sessions.issue(teamId, new Date(Date.now() + 60_000));
      const technical = await sessions.issue(
        technicalId,
        new Date(Date.now() + 60_000),
      );
      const base = (await app.getUrl()) + "/api/v1/interno/aplicaciones-ibite/";
      const read = (id, token, query = "") =>
        fetch(base + id + "/resultados" + query, {
          headers: token ? { authorization: "Bearer " + token } : {},
        });
      assert.equal((await read(applicationId)).status, 401);
      assert.equal((await read(applicationId, technical.token)).status, 403);
      assert.equal(
        (
          await fetch(baseAssignments, {
            headers: { authorization: "Bearer " + technical.token },
          })
        ).status,
        403,
      );
      assert.equal((await read(applicationId, team.token)).status, 404);
      await assert.rejects(
        replayIbiteApplication(client, teamId, applicationId),
        /no disponible/,
      );
      const assignmentUrl =
        (await app.getUrl()) +
        "/api/v1/interno/asignaciones-psicosociales/" +
        teamId +
        "/" +
        institutionId;
      const changeScope = (method, token = technical.token) =>
        fetch(assignmentUrl, {
          method,
          headers: { authorization: "Bearer " + token },
        });
      const auditUrl =
        (await app.getUrl()) +
        "/api/v1/interno/instituciones/" +
        institutionId +
        "/auditoria";
      const readAudit = (token, query = "") =>
        fetch(auditUrl + query, {
          headers: token ? { authorization: "Bearer " + token } : {},
        });
      assert.equal((await readAudit()).status, 401);
      assert.equal((await readAudit(technical.token)).status, 403);
      assert.equal((await readAudit(team.token)).status, 404);
      assert.equal((await changeScope("PUT", team.token)).status, 403);
      assert.equal((await changeScope("PUT")).status, 204);
      assert.equal((await changeScope("PUT")).status, 204);
      assert.equal((await read("invalid", team.token)).status, 400);
      const response = await read(applicationId, team.token);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const payload = await response.json();
      assert.deepEqual(Object.keys(payload).sort(), [
        "applicationId",
        "nextCursor",
        "results",
        "truncated",
      ]);
      assert.equal(payload.results.length, 3);
      assert.equal(payload.truncated, false);
      assert.ok(
        payload.results.every(
          (result) => result.ruleVersion === version.ruleVersion,
        ),
      );
      const unscoped = await client.auditEvent.create({
        data: {
          actorId: teamId,
          targetId: applicationId,
          action: "qa.unscoped",
        },
      });
      const audited = await readAudit(team.token);
      assert.equal(audited.status, 200);
      assert.equal(audited.headers.get("cache-control"), "no-store");
      const audit = await audited.json();
      assert.equal(audit.institutionId, institutionId);
      assert.equal(audit.truncated, false);
      assert.deepEqual(audit.items.map(({ action }) => action).sort(), [
        "ibite.application.finalized",
        "ibite.results.read",
        "scope.granted",
      ]);
      assert.deepEqual(Object.keys(audit.items[0]).sort(), [
        "action",
        "actorId",
        "id",
        "occurredAt",
        "targetId",
      ]);
      const listAssignmentUrl =
        (await app.getUrl()) +
        "/api/v1/interno/asignaciones-psicosociales/instituciones/" +
        institutionId;
      const listScope = (token, query = "") =>
        fetch(listAssignmentUrl + query, {
          headers: { authorization: "Bearer " + token },
        });
      assert.equal((await listScope(team.token)).status, 403);
      assert.equal(
        (await listScope(technical.token, "?after=bad")).status,
        400,
      );
      const scopes = await (await listScope(technical.token)).json();
      assert.deepEqual(scopes, {
        institutionId,
        items: [{ professionalId: teamId, revokedAt: null }],
        nextCursor: null,
      });
      assert.equal(
        (await readAudit(team.token, "?after=" + unscoped.id)).status,
        404,
      );
      assert.equal(
        (await read(applicationId, team.token, "?after=" + randomUUID()))
          .status,
        404,
      );
      assert.equal(
        (await read(applicationId, team.token, "?after=bad")).status,
        400,
      );

      await assert.rejects(
        replayIbiteApplication(client, technicalId, applicationId),
        /no disponible/,
      );
      const beforeReplay = await client.ibiteResult.count({
        where: { applicationId },
      });
      const replayed = await replayIbiteApplication(
        client,
        teamId,
        applicationId,
      );
      const storedResult = await client.ibiteResult.findFirstOrThrow({
        where: {
          applicationId,
          provenance: { path: ["kind"], equals: "calculated" },
        },
      });
      assert.deepEqual(replayed, storedResult.result);
      await client.account.update({
        where: { id: teamId },
        data: { active: false },
      });
      assert.equal((await read(applicationId, team.token)).status, 401);
      assert.equal((await readAudit(team.token)).status, 401);
      await assert.rejects(
        replayIbiteApplication(client, teamId, applicationId),
        /no disponible/,
      );
      await client.account.update({
        where: { id: teamId },
        data: { active: true },
      });
      assert.equal(
        await client.ibiteResult.count({ where: { applicationId } }),
        beforeReplay,
      );
      assert.equal(
        await client.auditEvent.count({
          where: { institutionId, action: "ibite.application.replayed" },
        }),
        1,
      );

      const older = new Date("2026-01-01T00:00:00Z");
      await client.ibiteResult.createMany({
        data: Array.from({ length: 24 }, () => ({
          applicationId,
          ruleVersion: version.ruleVersion,
          calculatedAt: older,
          provenance: { type: "synthetic" },
          result: { complete: false },
        })),
      });
      const resultFirst = await (await read(applicationId, team.token)).json();
      assert.equal(resultFirst.results.length, 25);
      assert.equal(resultFirst.truncated, true);
      const resultSecond = await (
        await read(
          applicationId,
          team.token,
          "?after=" + resultFirst.nextCursor,
        )
      ).json();
      assert.equal(resultSecond.results.length, 2);
      assert.equal(resultSecond.nextCursor, null);
      assert.equal(
        new Set(
          [...resultFirst.results, ...resultSecond.results].map(({ id }) => id),
        ).size,
        27,
      );

      await client.auditEvent.createMany({
        data: Array.from({ length: 26 }, () => ({
          institutionId,
          actorId: teamId,
          targetId: applicationId,
          action: "qa.pagination",
          occurredAt: older,
        })),
      });
      const auditFirst = await (await readAudit(team.token)).json();
      assert.equal(auditFirst.items.length, 25);
      assert.equal(auditFirst.truncated, true);
      const auditSecond = await (
        await readAudit(team.token, "?after=" + auditFirst.nextCursor)
      ).json();
      assert.ok(auditSecond.items.length > 0);
      assert.equal(auditSecond.nextCursor, null);
      const allAudited = [...auditFirst.items, ...auditSecond.items];
      assert.equal(
        new Set(allAudited.map(({ id }) => id)).size,
        allAudited.length,
      );
      assert.equal(
        allAudited.filter(({ action }) => action === "qa.pagination").length,
        26,
      );
      assert.equal((await changeScope("DELETE")).status, 204);
      assert.equal((await changeScope("DELETE")).status, 204);
      assert.equal((await readAudit(team.token)).status, 404);
      const events = await client.auditEvent.findMany({
        where: { institutionId },
        orderBy: { action: "asc" },
      });
      assert.equal(
        events.filter(({ action }) => action === "scope.granted").length,
        1,
      );
      assert.equal(
        events.filter(({ action }) => action === "scope.revoked").length,
        1,
      );
      assert.equal(
        events.filter(({ action }) => action === "audit.institution.read")
          .length,
        3,
      );
      const revoked = await (await listScope(technical.token)).json();
      assert.equal(revoked.items[0].professionalId, teamId);
      assert.ok(revoked.items[0].revokedAt);
      assert.equal((await read(applicationId, team.token)).status, 404);
      await assert.rejects(
        replayIbiteApplication(client, teamId, applicationId),
        /no disponible/,
      );
      const openapi = await (
        await fetch((await app.getUrl()) + "/docs-json")
      ).json();
      for (const request of [getRequest, postRequest, declineRequest]) {
        const path = request.url
          .replace("{{baseUrl}}", "")
          .replace("{{habilitacionId}}", "{habilitacionId}");
        const operation = openapi.paths[path][request.method.toLowerCase()];
        assert.ok(
          operation.security.some(({ bearer }) => Array.isArray(bearer)),
        );
      }
      assert.ok(
        openapi.paths[
          "/api/v1/interno/aplicaciones-ibite/{aplicacionId}/resultados"
        ],
      );

      const daVersion = await client.instrumentVersion.findFirstOrThrow({
        where: { instrumentCode: "IBITE-DA-28" },
      });
      const teacher = await client.role.findUniqueOrThrow({
        where: { code: "TEACHER" },
      });
      await client.accountRole.create({
        data: { accountId: otherRespondentId, roleId: teacher.id },
      });
      const daCampaign = await client.ibiteCampaign.create({
        data: {
          institutionId,
          periodId,
          instrumentCode: daVersion.instrumentCode,
          variant: daVersion.variant,
          sourceVersion: daVersion.sourceVersion,
          opensAt: new Date(Date.now() - 60_000),
          closesAt: new Date(Date.now() + 60_000),
        },
      });
      const daAssignment = await client.ibiteAssignment.create({
        data: {
          campaignId: daCampaign.id,
          participantId,
          respondentId: otherRespondentId,
        },
      });
      const daSubmission = {
        ...submission,
        acceptedFormVersion: undefined,
        reportedRepresentativeAuthorization: undefined,
        idempotencyKey: randomUUID(),
        assignmentId: daAssignment.id,
        authenticatedAccountId: otherRespondentId,
        answers: Array(28).fill("Poco"),
      };
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...daSubmission,
          reportedRepresentativeAuthorization: "unknown",
        }),
        /solo en IBITE-17 adolescente/,
      );
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...daSubmission,
          answers: daSubmission.answers.slice(0, 27),
        }),
        /28 posiciones/,
      );
      assert.equal(
        await client.ibiteApplication.count({
          where: { assignmentId: daAssignment.id },
        }),
        0,
      );
      const da = await persistValidatedSubmission(client, daSubmission);
      assert.deepEqual(
        await persistValidatedSubmission(client, daSubmission),
        da,
      );
      const daResult = await client.ibiteResult.findFirstOrThrow({
        where: { applicationId: da.id },
      });
      assert.equal(daResult.ruleVersion, daVersion.ruleVersion);
      assert.equal(daResult.result.dimensions.items.length, 28);
      assert.equal(
        await client.auditEvent.count({
          where: { targetId: da.id, action: "ibite.application.finalized" },
        }),
        1,
      );
      const daReceiptPath = "/" + daAssignment.id + "/acuse";
      assert.equal((await list(daReceiptPath)).status, 404);
      assert.equal(
        (await (await readOther(daReceiptPath)).json()).applicationId,
        da.id,
      );

      assert.equal((await changeScope("PUT")).status, 204);
      assert.deepEqual(
        await replayIbiteApplication(client, teamId, da.id),
        daResult.result,
      );
      assert.equal(
        (await read(applicationId, team.token, "?after=" + daResult.id)).status,
        404,
      );

      const daApplication = await client.ibiteApplication.findUniqueOrThrow({
        where: { id: da.id },
      });
      await client.ibiteApplication.update({
        where: { id: da.id },
        data: {
          provenance: { kind: "prospective", sourceSha256: "0".repeat(64) },
        },
      });
      await assert.rejects(
        replayIbiteApplication(client, teamId, da.id),
        /Origen de aplicación no compatible/,
      );
      assert.equal(
        await client.auditEvent.count({
          where: { targetId: da.id, action: "ibite.application.replayed" },
        }),
        1,
      );
      await client.ibiteApplication.update({
        where: { id: da.id },
        data: { provenance: daApplication.provenance },
      });

      const alternateVersion = await client.instrumentVersion.findFirstOrThrow({
        where: {
          instrumentCode: version.instrumentCode,
          variant: { not: version.variant },
        },
      });
      const alternateCampaign = await client.ibiteCampaign.create({
        data: {
          institution: {
            create: {
              id: alternateInstitutionId,
              code: code + "-ALT",
              name: "Segunda institución sintética",
            },
          },
          period: { connect: { id: periodId } },
          instrumentVersion: {
            connect: {
              instrumentCode_variant_sourceVersion: {
                instrumentCode: alternateVersion.instrumentCode,
                variant: alternateVersion.variant,
                sourceVersion: alternateVersion.sourceVersion,
              },
            },
          },
          opensAt: new Date(Date.now() - 60_000),
          closesAt: new Date(Date.now() + 60_000),
        },
      });
      const alternateAssignment = await client.ibiteAssignment.create({
        data: {
          campaignId: alternateCampaign.id,
          participantId,
          respondentId: otherRespondentId,
        },
      });
      await assert.rejects(
        persistValidatedSubmission(client, {
          ...submission,
          reportedRepresentativeAuthorization: undefined,
          assignmentId: alternateAssignment.id,
          authenticatedAccountId: otherRespondentId,
        }),
        (error) => error.code === "P2002",
      );
      assert.equal(
        (await readOther("/" + alternateAssignment.id + "/acuse")).status,
        404,
      );
      assert.equal(
        await client.auditEvent.count({
          where: { institutionId: alternateInstitutionId },
        }),
        0,
      );

      await client.participant.create({ data: { id: refusalParticipantId } });
      const refusalAssignment = await client.ibiteAssignment.create({
        data: {
          campaignId: campaign.id,
          participantId: refusalParticipantId,
          respondentId: otherRespondentId,
        },
      });
      const decline = (id, token, body = { formVersion: form.formVersion }) =>
        fetch(baseAssignments + "/" + id + "/negativa", {
          method: "POST",
          headers: {
            authorization: "Bearer " + token,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        });
      assert.equal(
        (await decline(refusalAssignment.id, respondent.token)).status,
        404,
      );
      assert.equal(
        (await decline(assignment.id, respondent.token)).status,
        409,
      );
      assert.equal(
        (
          await decline(refusalAssignment.id, other.token, {
            formVersion: "previa",
          })
        ).status,
        409,
      );
      const representativeRefusal = JSON.parse(declineRequest.body.raw);
      const [firstRefusal, retryRefusal] = await Promise.all([
        decline(refusalAssignment.id, other.token, representativeRefusal),
        decline(refusalAssignment.id, other.token, representativeRefusal),
      ]);
      assert.equal(firstRefusal.status, 201);
      assert.equal(retryRefusal.status, 201);
      const record = await firstRefusal.json();
      assert.equal(record.assignmentId, refusalAssignment.id);
      assert.equal(record.reason, "REPRESENTATIVE_AUTHORIZATION");
      assert.deepEqual(await retryRefusal.json(), record);
      assert.equal(
        (await decline(refusalAssignment.id, other.token)).status,
        409,
      );
      assert.equal(
        (
          await (
            await readOther("/" + refusalAssignment.id + "/formulario")
          ).json()
        ).participationDeclined,
        true,
      );
      assert.equal(
        (await readOther("/" + refusalAssignment.id + "/acuse")).status,
        404,
      );
      assert.equal(
        (
          await fetch(
            baseAssignments + "/" + refusalAssignment.id + "/envios",
            {
              method: "POST",
              headers: {
                authorization: "Bearer " + other.token,
                "content-type": "application/json",
                "Idempotency-Key": randomUUID(),
              },
              body: JSON.stringify(answerBody),
            },
          )
        ).status,
        409,
      );
      assert.equal(
        await client.ibiteApplication.count({
          where: { assignmentId: refusalAssignment.id },
        }),
        0,
      );
      assert.equal(
        await client.auditEvent.count({
          where: {
            targetId: refusalAssignment.id,
            action: "ibite.authorization.declined",
          },
        }),
        1,
      );
      await client.ibiteAssignment.update({
        where: { id: refusalAssignment.id },
        data: { revokedAt: new Date() },
      });
      assert.equal(
        (await decline(refusalAssignment.id, other.token)).status,
        404,
      );
      const raceAssignment = await client.ibiteAssignment.create({
        data: {
          campaignId: campaign.id,
          participantId: refusalParticipantId,
          respondentId,
        },
      });
      const decisions = await Promise.all([
        decline(raceAssignment.id, respondent.token),
        fetch(baseAssignments + "/" + raceAssignment.id + "/envios", {
          method: "POST",
          headers: {
            authorization: "Bearer " + respondent.token,
            "content-type": "application/json",
            "Idempotency-Key": randomUUID(),
          },
          body: JSON.stringify(answerBody),
        }),
      ]);
      assert.deepEqual(
        decisions.map(({ status }) => status).sort(),
        [201, 409],
      );
      const saved = await client.ibiteAssignment.findUniqueOrThrow({
        where: { id: raceAssignment.id },
        select: { refusal: true, applications: { select: { id: true } } },
      });
      assert.equal(
        saved.applications.length + Number(saved.refusal !== null),
        1,
      );

      // Presentation scenarios read the result through the institutional API.
      const demoScenarios = [];
      const summarize = async (
        id,
        token,
        expectedSignal,
        expectedRisk,
        expectedObserved,
        expectedUnclear,
      ) => {
        const response = await read(id, token);
        assert.equal(response.status, 200);
        const { results } = await response.json();
        const { result } = results.find(
          ({ provenance }) => provenance.kind === "calculated",
        );
        assert.equal(result.dimensions.safetySignal, expectedSignal);
        if (expectedRisk)
          assert.equal(result.classification.risk, expectedRisk);
        assert.deepEqual(
          result.safetyObservations.observedItems,
          expectedObserved,
        );
        assert.deepEqual(
          result.safetyObservations.unclearItems,
          expectedUnclear,
        );
        return {
          señal: result.dimensions.safetySignal,
          clasificación: result.classification.risk,
          ítemsConSeñal: result.safetyObservations.observedItems,
          ítemsPorAclarar: result.safetyObservations.unclearItems,
        };
      };
      assert.equal((await read(applicationId, respondent.token)).status, 403);
      demoScenarios.push({
        caso: "Adolescente · autorización No sé",
        http: acceptedResponse.status,
        ...(await summarize(
          applicationId,
          team.token,
          "alerta",
          "critico_seguridad",
          [7],
          [8],
        )),
      });
      const caregiverRole = await client.role.findUniqueOrThrow({
        where: { code: "CAREGIVER" },
      });
      await client.accountRole.create({
        data: { accountId: otherRespondentId, roleId: caregiverRole.id },
      });
      for (const [index, option] of ["unclear", "zero"].entries()) {
        await client.participant.create({
          data: { id: demoParticipantIds[index] },
        });
        const demoAssignment = await client.ibiteAssignment.create({
          data: {
            campaignId: alternateCampaign.id,
            respondentId: otherRespondentId,
            participantId: demoParticipantIds[index],
          },
        });
        const demoPath = "/" + demoAssignment.id;
        const caregiverView = await (
          await readOther(demoPath + "/formulario")
        ).json();
        assert.equal(caregiverView.variant, "CAREGIVER");
        assert.deepEqual(caregiverView.authorizationOptions, []);
        const caregiverPost = await fetch(
          baseAssignments + demoPath + "/envios",
          {
            method: "POST",
            headers: {
              authorization: "Bearer " + other.token,
              "content-type": "application/json",
              "Idempotency-Key": randomUUID(),
            },
            body: JSON.stringify({
              formVersion: caregiverView.formVersion,
              participation: "accepted",
              answers: caregiverView.questions.map(({ id }) => ({
                questionId: id,
                optionId: id === "q7" ? option : "zero",
              })),
            }),
          },
        );
        assert.equal(caregiverPost.status, 201);
        const caregiverReceipt = await caregiverPost.json();
        assert.deepEqual(
          await (await readOther(demoPath + "/acuse")).json(),
          caregiverReceipt,
        );
        if (index === 0) {
          assert.equal(
            (await read(caregiverReceipt.applicationId, team.token)).status,
            404,
          );
          assert.equal(
            (
              await fetch(
                assignmentUrl.replace(institutionId, alternateInstitutionId),
                {
                  method: "PUT",
                  headers: { authorization: "Bearer " + technical.token },
                },
              )
            ).status,
            204,
          );
        }
        demoScenarios.push({
          caso:
            index === 0
              ? "Acudiente · seguridad por aclarar"
              : "Acudiente · sin señal de seguridad",
          http: caregiverPost.status,
          ...(await summarize(
            caregiverReceipt.applicationId,
            team.token,
            index === 0 ? "no_aclarada" : "ninguna",
            index === 0 ? "alto_seguridad_no_aclarada" : null,
            [],
            index === 0 ? [7] : [],
          )),
        });
      }
      for (const scenario of demoScenarios)
        context.diagnostic("DEMO IBITE " + JSON.stringify(scenario));

      const campaignState = (id, token, enabled) =>
        fetch(
          baseAssignments.replace(
            "/mis-aplicaciones-ibite",
            "/interno/campanas-ibite",
          ) +
            "/" +
            id +
            "/estado",
          {
            method: "PUT",
            headers: {
              authorization: "Bearer " + token,
              "content-type": "application/json",
            },
            body: JSON.stringify({ enabled }),
          },
        );
      const publicStart = (id, body) =>
        fetch(
          baseAssignments.replace(
            "/mis-aplicaciones-ibite",
            "/ibite/campanas",
          ) +
            "/" +
            id +
            "/iniciar",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          },
        );
      assert.equal(
        (
          await publicStart(campaign.id, {
            age: 10,
            documentNumber: "00001001",
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await publicStart(campaign.id, {
            age: 10,
            documentNumber: "00001001",
            studentName: "Estudiante sintético",
            contactPhone: "3000000010",
          })
        ).status,
        404,
      );
      const startByDocument = async () => {
        const response = await publicStart(campaign.id, {
          age: 11,
          documentNumber: "00001001",
        });
        assert.equal(response.status, 201);
        assert.equal(response.headers.get("cache-control"), "no-store");
        const entry = await response.json();
        const assignment = await client.ibiteAssignment.findUniqueOrThrow({
          where: { id: entry.assignmentId },
        });
        fixtureAccountIds.push(assignment.respondentId);
        fixtureParticipantIds.push(assignment.participantId);
        return { ...entry, participantId: assignment.participantId };
      };
      const directFirst = await startByDocument();
      const directSecond = await startByDocument();
      assert.equal(directFirst.participantId, directSecond.participantId);
      assert.notEqual(directFirst.assignmentId, directSecond.assignmentId);
      const directRequest = (entry, segment, options = {}) =>
        fetch(baseAssignments + "/" + entry.assignmentId + "/" + segment, {
          ...options,
          headers: {
            authorization: "Bearer " + entry.token,
            ...options.headers,
          },
        });
      const directSubmit = (entry) =>
        directRequest(entry, "envios", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": randomUUID(),
          },
          body: JSON.stringify(answerBody),
        });
      assert.equal(
        (await directRequest(directFirst, "formulario")).status,
        200,
      );
      assert.equal((await directSubmit(directFirst)).status, 201);
      assert.equal((await directSubmit(directSecond)).status, 409);
      assert.equal((await directRequest(directSecond, "acuse")).status, 404);
      assert.equal(
        (
          await directRequest(
            { ...directFirst, token: directSecond.token },
            "acuse",
          )
        ).status,
        404,
      );
      const caregiverIdentities = [];
      for (const studentName of [
        "Estudiante sintético A",
        "Estudiante sintético B",
      ]) {
        const response = await publicStart(alternateCampaign.id, {
          age: 10,
          documentNumber: "00001001",
          studentName,
          contactPhone: "3000000010",
        });
        assert.equal(response.status, 201);
        const entry = await response.json();
        const assignment = await client.ibiteAssignment.findUniqueOrThrow({
          where: { id: entry.assignmentId },
        });
        fixtureAccountIds.push(assignment.respondentId);
        fixtureParticipantIds.push(assignment.participantId);
        caregiverIdentities.push(assignment.participantId);
        const responseForm = await directRequest(entry, "formulario");
        assert.equal(responseForm.status, 200);
        const caregiverView = await responseForm.json();
        assert.equal(caregiverView.variant, "CAREGIVER");
        const result = await directRequest(entry, "envios", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": randomUUID(),
          },
          body: JSON.stringify({
            formVersion: caregiverView.formVersion,
            participation: "accepted",
            answers: caregiverView.questions.map(({ id }) => ({
              questionId: id,
              optionId: "zero",
            })),
          }),
        });
        assert.equal(result.status, 201);
      }
      assert.notEqual(caregiverIdentities[0], caregiverIdentities[1]);
      assert.equal(
        (await campaignState(campaign.id, respondent.token, false)).status,
        403,
      );
      assert.equal(
        (await campaignState(campaign.id, technical.token, false)).status,
        404,
      );
      await client.account.create({
        data: { id: selfStudentId, roles: { create: { roleId: student.id } } },
      });
      const newcomer = await sessions.issue(
        selfStudentId,
        new Date(Date.now() + 60_000),
      );
      const start = (token, id = campaign.id) =>
        fetch(baseAssignments + "/campanas/" + id + "/iniciar", {
          method: "POST",
          headers: { authorization: "Bearer " + token },
        });
      assert.equal((await start(technical.token)).status, 403);
      assert.equal((await start(newcomer.token, daCampaign.id)).status, 404);
      const [firstStart, repeatedStart] = await Promise.all([
        start(newcomer.token),
        start(newcomer.token),
      ]);
      assert.equal(firstStart.status, 200);
      assert.equal(repeatedStart.status, 200);
      const { assignmentId: selfAssignmentId } = await firstStart.json();
      assert.deepEqual(await repeatedStart.json(), {
        assignmentId: selfAssignmentId,
      });
      const self = await client.participant.findUniqueOrThrow({
        where: { selfAccountId: selfStudentId },
      });
      fixtureParticipantIds.push(self.id);
      const selfPath = "/" + selfAssignmentId;
      assert.equal((await readOther(selfPath + "/formulario")).status, 404);
      assert.equal(
        (
          await fetch(baseAssignments + selfPath + "/formulario", {
            headers: { authorization: "Bearer " + newcomer.token },
          })
        ).status,
        200,
      );
      const selfSubmit = await fetch(baseAssignments + selfPath + "/envios", {
        method: "POST",
        headers: {
          authorization: "Bearer " + newcomer.token,
          "content-type": "application/json",
          "Idempotency-Key": randomUUID(),
        },
        body: JSON.stringify(answerBody),
      });
      assert.equal(selfSubmit.status, 201);
      assert.equal(
        await client.ibiteApplication.count({
          where: { participantId: self.id },
        }),
        1,
      );
      assert.equal(
        await client.auditEvent.count({
          where: {
            targetId: selfAssignmentId,
            action: "ibite.assignment.self_started",
          },
        }),
        1,
      );
      await client.ibiteAssignment.update({
        where: { id: selfAssignmentId },
        data: { revokedAt: new Date() },
      });
      assert.equal((await start(newcomer.token)).status, 409);
      await client.accountInstitution.create({
        data: { accountId: technicalId, institutionId },
      });
      assert.equal(
        (await campaignState(daCampaign.id, technical.token, false)).status,
        404,
      );
      assert.equal(
        (await campaignState(campaign.id, technical.token, "false")).status,
        400,
      );
      const pauses = await Promise.all([
        campaignState(campaign.id, technical.token, false),
        campaignState(campaign.id, technical.token, false),
      ]);
      assert.deepEqual(
        pauses.map(({ status }) => status),
        [204, 204],
      );
      assert.equal((await list(formPath)).status, 404);
      assert.equal((await post()).status, 404);
      assert.equal((await read(applicationId, team.token)).status, 200);
      assert.equal(
        await client.auditEvent.count({
          where: { targetId: campaign.id, action: "ibite.campaign.disabled" },
        }),
        1,
      );
      assert.equal(
        (await campaignState(campaign.id, technical.token, true)).status,
        204,
      );
      assert.equal((await list(formPath)).status, 200);
      assert.equal((await list(receiptPath)).status, 200);
      await client.accountInstitution.delete({
        where: {
          accountId_institutionId: { accountId: technicalId, institutionId },
        },
      });
      assert.equal(
        (await campaignState(campaign.id, technical.token, false)).status,
        404,
      );
      // Restart Nest against the same database with the same configured key.
      await app.close();
      app = await boot();
      await app.listen(0, "127.0.0.1");
      ({ client } = app.get(DatabaseService));
      baseAssignments = (await app.getUrl()) + "/api/v1/mis-aplicaciones-ibite";
      const afterRestart = await startByDocument();
      assert.equal(afterRestart.participantId, directFirst.participantId);
      assert.equal((await directSubmit(afterRestart)).status, 409);
      assert.equal((await directRequest(afterRestart, "acuse")).status, 404);
      assert.equal((await directRequest(directFirst, "acuse")).status, 200);
      assert.equal(
        await client.ibiteApplication.count({
          where: { participantId: directFirst.participantId },
        }),
        1,
      );
      const mttsUrl =
        (await app.getUrl()) +
        "/api/v1/interno/instituciones/" +
        institutionId +
        "/mtts";
      const auth = { authorization: "Bearer " + team.token };
      const mtts = await fetch(mttsUrl + "/formato-a", { headers: auth });
      assert.equal(mtts.status, 200);
      const definition = await mtts.json();
      assert.equal(definition.dimensions.length, 8);
      const mttsPayload = {
        version: definition.version,
        site: "Sede QA",
        weekStart: "2026-11-23",
        weekEnd: "2026-11-29",
        role: "Coordinación",
        activities: ["Revisión de alertas/tablero"],
        countsUnavailable: false,
        counts: { valoraciones: 0 },
        ratings: { factibilidad: "NA", fidelidad: 4 },
        barriers: [],
        facilitators: [],
        adjustment: "No",
        status: "En curso según lo previsto",
        escalation: false,
      };
      const submitMtts = (body, token = team.token) =>
        fetch(mttsUrl + "/fichas", {
          method: "POST",
          headers: {
            authorization: "Bearer " + token,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        });
      assert.equal(
        (await submitMtts(mttsPayload, respondent.token)).status,
        403,
      );
      assert.equal(
        (await submitMtts({ ...mttsPayload, ratings: { seguridad: 6 } }))
          .status,
        400,
      );
      assert.equal(
        (await submitMtts({ ...mttsPayload, countsUnavailable: true })).status,
        400,
      );
      assert.equal(
        (
          await submitMtts({
            ...mttsPayload,
            barriers: definition.barriers.slice(0, 4),
          })
        ).status,
        400,
      );
      const reports = await Promise.all([
        submitMtts(mttsPayload),
        submitMtts({ ...mttsPayload, site: "  sede   QA  " }),
      ]);
      assert.deepEqual(reports.map(({ status }) => status).sort(), [201, 409]);
      const { id: reportId } = await reports
        .find(({ status }) => status === 201)
        .json();
      const detail = mttsUrl + "/fichas/" + reportId;
      const row = await (await fetch(detail, { headers: auth })).json();
      assert.deepEqual(row.payload.ratings, {
        factibilidad: "NA",
        fidelidad: 4,
      });
      assert.deepEqual(row.payload.counts, { valoraciones: 0 });
      assert.equal(
        await client.auditEvent.count({ where: { targetId: reportId } }),
        2,
      );
      const feasibilityUrl = mttsUrl.replace(
        "/mtts",
        "/factibilidad/formulario",
      );
      assert.equal((await fetch(feasibilityUrl)).status, 401);
      assert.equal(
        (
          await fetch(feasibilityUrl, {
            headers: { authorization: "Bearer " + respondent.token },
          })
        ).status,
        403,
      );
      const feasibilityResponse = await fetch(feasibilityUrl, {
        headers: auth,
      });
      assert.equal(feasibilityResponse.status, 200);
      assert.equal(
        feasibilityResponse.headers.get("cache-control"),
        "no-store",
      );
      const feasibility = await feasibilityResponse.json();
      assert.equal(feasibility.status, "ready");
      assert.equal(feasibility.version, "jugar-para-cuidar/1");
      assert.deepEqual(feasibility.grids[0].visibleOptions, [
        "Sí",
        "Parcial",
        "No",
      ]);
      assert.equal(feasibility.grids[0].observedRows.length, 7);
      assert.equal(
        feasibility.grids[0].observedRows.at(-1),
        "Mantuve un clima respetuoso, sin juzgar las respuestas",
      );
      assert.equal(feasibility.grids[1].observedRows.length, 3);
      assert.equal(
        feasibility.grids[1].observedRows.at(-1),
        "Mostraron interés en llevar los juegos a casa",
      );
      assert.equal(feasibility.workshop, "Jugar para cuidar");
      assert.equal(feasibility.fields.length, 8);
      assert.deepEqual(
        feasibility.observedInstitutionLabels,
        pilot.institutions,
      );
      assert.deepEqual(feasibility.grids[1].visibleOptions, [
        "Muy bajo",
        "Bajo",
        "Aceptable",
        "Alto",
        "Muy alto",
      ]);
      const evaluationUrl = feasibilityUrl.replace(
        "/formulario",
        "/evaluaciones",
      );
      const workshopBody = {
        version: feasibility.version,
        workshopDate: "2026-11-21",
        place: "Salón de prueba",
        attendance: "8 familias",
        facilitator: "Facilitador sintético",
        improvements: "Preparar otro juego",
        workshopDelivery: Array(7).fill("Sí"),
        process: ["Alto", "Aceptable", "Muy alto"],
      };
      const writeWorkshop = (body, token = team.token, key) =>
        fetch(evaluationUrl, {
          method: "POST",
          headers: {
            authorization: "Bearer " + token,
            "content-type": "application/json",
            ...(key === undefined ? {} : { "Idempotency-Key": key }),
          },
          body: JSON.stringify(body),
        });
      assert.equal(
        (await writeWorkshop(workshopBody, respondent.token)).status,
        403,
      );
      assert.equal(
        (
          await writeWorkshop({
            ...workshopBody,
            institutionIds: [institutionId, alternateInstitutionId],
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await writeWorkshop({
            ...workshopBody,
            process: ["Alto", "Aceptable"],
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await writeWorkshop({
            ...workshopBody,
            workshopDelivery: ["Alto", ...Array(6).fill("Sí")],
          })
        ).status,
        400,
      );
      const workshopResponse = await writeWorkshop(workshopBody);
      assert.equal(workshopResponse.status, 201);
      const evaluationId = (await workshopResponse.json()).id;
      const workshopDetail = evaluationUrl + "/" + evaluationId;
      const evaluationResponse = await fetch(workshopDetail, { headers: auth });
      assert.equal(evaluationResponse.status, 200);
      const evaluation = await evaluationResponse.json();
      assert.equal(evaluation.institutionId, institutionId);
      assert.equal(evaluation.payload.attendance, "8 familias");
      assert.deepEqual(evaluation.payload.process, workshopBody.process);
      assert.equal(
        await client.auditEvent.count({ where: { targetId: evaluationId } }),
        2,
      );
      const retryKey = randomUUID();
      const [newWorkshop, retryWorkshop] = await Promise.all([
        writeWorkshop(workshopBody, team.token, retryKey),
        writeWorkshop(workshopBody, team.token, retryKey),
      ]);
      assert.equal(newWorkshop.status, 201);
      assert.equal(retryWorkshop.status, 201);
      const retryReceipt = await newWorkshop.json();
      assert.deepEqual(await retryWorkshop.json(), retryReceipt);
      assert.equal(
        await client.auditEvent.count({
          where: {
            targetId: retryReceipt.id,
            action: "feasibility.workshop.submitted",
          },
        }),
        1,
      );
      assert.equal(
        (
          await writeWorkshop(
            { ...workshopBody, attendance: "9" },
            team.token,
            retryKey,
          )
        ).status,
        409,
      );
      assert.equal(
        (await writeWorkshop(workshopBody, team.token, "corta")).status,
        400,
      );
      const workshopList = evaluationUrl + "?desde=2026-11-21&hasta=2026-11-21";
      const listedWorkshops = await (
        await fetch(workshopList, { headers: auth })
      ).json();
      assert.deepEqual(
        new Set(listedWorkshops.items.map(({ id }) => id)),
        new Set([evaluationId, retryReceipt.id]),
      );
      assert.equal(listedWorkshops.nextCursor, null);
      assert.ok(
        listedWorkshops.items.every(
          (entry) =>
            !Object.hasOwn(entry, "payload") &&
            !Object.hasOwn(entry, "authorId"),
        ),
      );
      const afterFirstWorkshop = await (
        await fetch(workshopList + "&after=" + listedWorkshops.items[0].id, {
          headers: auth,
        })
      ).json();
      assert.deepEqual(
        afterFirstWorkshop.items,
        listedWorkshops.items.slice(1),
      );
      assert.equal(
        (
          await fetch(
            evaluationUrl +
              "?desde=2026-11-22&hasta=2026-11-22&after=" +
              evaluationId,
            { headers: auth },
          )
        ).status,
        404,
      );
      const nextReport = await submitMtts({
        ...mttsPayload,
        weekStart: "2026-11-30",
        weekEnd: "2026-12-06",
        ratings: { fidelidad: 2 },
        barriers: [definition.barriers[0]],
      });
      assert.equal(nextReport.status, 201);
      const filters = "?desde=2026-11-23&hasta=2026-12-06";
      const summaryUrl = mttsUrl + "/resumen" + filters;
      assert.equal(
        (
          await fetch(summaryUrl, {
            headers: { authorization: "Bearer " + respondent.token },
          })
        ).status,
        403,
      );
      const summaryResponse = await fetch(summaryUrl, { headers: auth });
      assert.equal(summaryResponse.status, 200);
      assert.equal(summaryResponse.headers.get("cache-control"), "no-store");
      const summary = await summaryResponse.json();
      assert.equal(summary.total, 2);
      assert.equal(summary.dimensions.fidelidad.median, 3);
      assert.deepEqual(
        summary.dimensions.fidelidad.distribution,
        [0, 1, 0, 1, 0],
      );
      assert.deepEqual(summary.dimensions.factibilidad, {
        distribution: [0, 0, 0, 0, 0],
        median: null,
        rated: 0,
        notApplicable: 1,
        missing: 1,
        notApplicablePercent: 50,
      });
      assert.equal(summary.barriers[0].count, 1);
      const weekly = await (
        await fetch(summaryUrl + "&porSemana=true&sede=%20SEDE%20%20qa%20", {
          headers: auth,
        })
      ).json();
      assert.equal(weekly.total, 2);
      assert.deepEqual(
        weekly.weeks.map(({ weekStart, dimensions }) => [
          weekStart,
          dimensions.fidelidad.median,
        ]),
        [
          ["2026-11-23", 4],
          ["2026-11-30", 2],
        ],
      );
      assert.equal(
        weekly.weeks[0].dimensions.factibilidad.notApplicablePercent,
        100,
      );
      assert.equal(weekly.weeks[1].dimensions.factibilidad.missing, 1);
      assert.ok(!Object.hasOwn(summary, "weeks"));
      assert.equal(
        (await fetch(summaryUrl + "&porSemana=1", { headers: auth })).status,
        400,
      );
      assert.equal(
        (await fetch(summaryUrl + "&sede=%20", { headers: auth })).status,
        400,
      );
      const empty = await (
        await fetch(mttsUrl + "/resumen?desde=2026-11-01&hasta=2026-11-02", {
          headers: auth,
        })
      ).json();
      assert.equal(empty.total, 0);
      assert.equal(empty.dimensions.fidelidad.notApplicablePercent, null);
      assert.equal(
        (
          await fetch(mttsUrl + "/resumen?desde=2026-12-06&hasta=2026-11-23", {
            headers: auth,
          })
        ).status,
        400,
      );
      await client.mttsWeeklyReport.createMany({
        data: Array.from({ length: 24 }, (_, index) => ({
          institutionId,
          authorId: teamId,
          site: "Sede ficticia " + index,
          siteKey: "sede ficticia " + index,
          formVersion: definition.version,
          weekStart: new Date("2026-11-23"),
          weekEnd: new Date("2026-11-29"),
          payload: { ratings: {}, barriers: [], facilitators: [] },
        })),
      });
      const listUrl = mttsUrl + "/fichas" + filters;
      const siteList = await (
        await fetch(listUrl + "&sede=sede%20QA", { headers: auth })
      ).json();
      assert.equal(siteList.items.length, 2);
      assert.equal(siteList.nextCursor, null);
      assert.equal(
        (
          await fetch(listUrl + "&sede=Sede%20ficticia%200&after=" + reportId, {
            headers: auth,
          })
        ).status,
        404,
      );
      const page = await (await fetch(listUrl, { headers: auth })).json();
      assert.equal(page.items.length, 25);
      assert.ok(page.nextCursor);
      assert.equal(page.items[0].weekStart, "2026-11-30T00:00:00.000Z");
      assert.ok(
        page.items.every(
          (item) =>
            !Object.hasOwn(item, "payload") && !Object.hasOwn(item, "authorId"),
        ),
      );
      const secondPage = await (
        await fetch(listUrl + "&after=" + page.nextCursor, { headers: auth })
      ).json();
      assert.equal(secondPage.items.length, 1);
      assert.equal(secondPage.nextCursor, null);
      assert.equal(
        new Set([...page.items, ...secondPage.items].map(({ id }) => id)).size,
        26,
      );
      assert.equal(
        (await fetch(listUrl + "&after=" + randomUUID(), { headers: auth }))
          .status,
        404,
      );
      const pointId = randomUUID();
      const outsidePointId = randomUUID();
      const feature = {
        type: "Feature",
        properties: { institutionCode: code, label: "Sede ficticia importada" },
        geometry: { type: "Point", coordinates: [-73.5, 5.1] },
      };
      const geoFile = (...features) =>
        Buffer.from(JSON.stringify({ type: "FeatureCollection", features }));
      const refused = await importInstitutionPoints(
        client,
        geoFile(feature, {
          ...feature,
          properties: {
            ...feature.properties,
            institutionCode: "SIN-CATALOGO-QA",
          },
        }),
        "Carga sintética",
      );
      assert.equal(refused.ready, false);
      assert.equal(refused.inserted, 0);
      assert.equal(
        await client.institutionMapPoint.count({ where: { institutionId } }),
        0,
      );
      const file = geoFile(feature);
      const pointPlan = await importInstitutionPoints(
        client,
        file,
        "Carga sintética",
        true,
      );
      assert.equal(pointPlan.pending, 1);
      assert.equal(
        await client.institutionMapPoint.count({ where: { institutionId } }),
        0,
      );
      const imports = await Promise.all([
        importInstitutionPoints(client, file, "Carga sintética"),
        importInstitutionPoints(client, file, "Carga sintética"),
      ]);
      assert.deepEqual(imports.map(({ inserted }) => inserted).sort(), [0, 1]);
      assert.equal(
        (await importInstitutionPoints(client, file, "Carga sintética", true))
          .pending,
        0,
      );
      assert.equal(
        await client.institutionMapPoint.count({
          where: { institutionId, sourcePosition: 1 },
        }),
        1,
      );
      await client.$executeRaw`
        INSERT INTO institution_map_points (id, institution_id, label, source, location)
        VALUES
          (${pointId}::uuid, ${institutionId}::uuid, 'Punto ficticio A', 'fixture', ST_SetSRID(ST_MakePoint(-75.5, 5.1), 4326)),
          (${outsidePointId}::uuid, ${institutionId}::uuid, 'Punto ficticio B', 'fixture', ST_SetSRID(ST_MakePoint(-74, 5.1), 4326))
      `;
      const pointPath = mttsUrl.replace("/mtts", "/sig/puntos");
      const importedGeo = await (
        await fetch(pointPath + "?bbox=-74,5,-73,6", { headers: auth })
      ).json();
      assert.ok(
        importedGeo.features.some(
          ({ properties, geometry }) =>
            properties.source === "Carga sintética" &&
            geometry.coordinates[0] === -73.5,
        ),
      );
      const pointQuery = pointPath + "?bbox=-76,5,-75,6";
      assert.equal(
        (
          await fetch(pointQuery, {
            headers: { authorization: "Bearer " + respondent.token },
          })
        ).status,
        403,
      );
      assert.equal(
        (await fetch(pointPath + "?bbox=-75,5,-76,6", { headers: auth }))
          .status,
        400,
      );
      assert.equal(
        (
          await fetch(pointQuery + "&after=" + outsidePointId, {
            headers: auth,
          })
        ).status,
        404,
      );
      const geo = await fetch(pointQuery, { headers: auth });
      assert.equal(geo.status, 200);
      assert.equal(geo.headers.get("cache-control"), "no-store");
      assert.deepEqual(await geo.json(), {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            id: pointId,
            geometry: { type: "Point", coordinates: [-75.5, 5.1] },
            properties: { label: "Punto ficticio A", source: "fixture" },
          },
        ],
        nextCursor: null,
      });
      await client.professionalInstitution.update({
        where: {
          professionalId_institutionId: {
            professionalId: teamId,
            institutionId,
          },
        },
        data: { revokedAt: new Date() },
      });
      assert.equal((await fetch(detail, { headers: auth })).status, 404);
      assert.equal((await fetch(pointQuery, { headers: auth })).status, 404);
      assert.equal(
        (await fetch(feasibilityUrl, { headers: auth })).status,
        404,
      );
      assert.equal((await writeWorkshop(workshopBody)).status, 404);
      assert.equal(
        (await writeWorkshop(workshopBody, team.token, retryKey)).status,
        404,
      );
      assert.equal((await fetch(workshopList, { headers: auth })).status, 404);
      assert.equal(
        (await fetch(workshopDetail, { headers: auth })).status,
        404,
      );
      assert.equal((await fetch(summaryUrl, { headers: auth })).status, 404);
      assert.equal((await fetch(listUrl, { headers: auth })).status, 404);
      assert.equal(
        (await submitMtts({ ...mttsPayload, site: "Otra sede QA" })).status,
        404,
      );
    } finally {
      await client.$transaction([
        client.$executeRaw`DELETE FROM institution_map_points WHERE institution_id = ${institutionId}::uuid`,
        client.workshopEvaluation.deleteMany({ where: { institutionId } }),
        client.mttsWeeklyReport.deleteMany({ where: { institutionId } }),
        client.auditEvent.deleteMany({
          where: {
            OR: [
              {
                institutionId: { in: [institutionId, alternateInstitutionId] },
              },
              { actorId: teamId, action: "qa.unscoped" },
            ],
          },
        }),
        client.ibiteResult.deleteMany({
          where: {
            application: {
              participantId: { in: fixtureParticipantIds },
            },
          },
        }),
        client.ibiteApplication.deleteMany({
          where: {
            participantId: { in: fixtureParticipantIds },
          },
        }),
        client.ibiteParticipationRefusal.deleteMany({
          where: { assignment: { participantId: refusalParticipantId } },
        }),
        client.ibiteAssignment.deleteMany({
          where: {
            participantId: { in: fixtureParticipantIds },
          },
        }),
        client.ibiteCampaign.deleteMany({
          where: {
            institutionId: { in: [institutionId, alternateInstitutionId] },
          },
        }),
        client.participant.deleteMany({
          where: { id: { in: fixtureParticipantIds } },
        }),
        client.professionalInstitution.deleteMany({
          where: {
            institutionId: { in: [institutionId, alternateInstitutionId] },
          },
        }),
        client.accountInstitution.deleteMany({ where: { institutionId } }),
        client.authSession.deleteMany({
          where: {
            accountId: {
              in: fixtureAccountIds,
            },
          },
        }),
        client.accountRole.deleteMany({
          where: {
            accountId: {
              in: fixtureAccountIds,
            },
          },
        }),
        client.rolePermission.deleteMany({
          where: { roleId: technicalRoleId },
        }),
        client.role.deleteMany({ where: { id: technicalRoleId } }),
        client.account.deleteMany({
          where: {
            id: { in: fixtureAccountIds },
          },
        }),
        client.institution.deleteMany({
          where: { id: { in: [institutionId, alternateInstitutionId] } },
        }),
        client.academicPeriod.deleteMany({ where: { id: periodId } }),
      ]);
    }
  },
);
