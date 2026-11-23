import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "../generated/prisma/client.js";
import { reconcileHistoricalWorkbook } from "./historical-reconciliation.js";

const analysisVersion = "ibite-historical-reconciliation/2";
type Workbook = Parameters<typeof reconcileHistoricalWorkbook>[0];
type ReviewState = "observada" | "requiere_revision";

async function requirePermission(
  tx: Prisma.TransactionClient,
  actorId: string,
  code: string,
) {
  const actor = await tx.account.findFirst({
    where: {
      id: actorId,
      active: true,
      roles: {
        some: { role: { permissions: { some: { permission: { code } } } } },
      },
    },
    select: { id: true },
  });
  if (!actor) throw new Error("Permiso de importación insuficiente");
}

export async function registerHistoricalDiagnostic(
  client: PrismaClient,
  actorId: string,
  workbook: Workbook,
) {
  return client.$transaction(async (tx) => {
    await requirePermission(tx, actorId, "imports:execute");
    const report = reconcileHistoricalWorkbook(workbook);
    const sourceSha256 = workbook.sourceSha256.toLowerCase();
    const incidents = [
      ...report.responses.flatMap(({ origin, issues }) =>
        issues.map((code) => ({
          key: "respuesta:" + origin.row + ":" + code,
          sheet: origin.sheet,
          row: origin.row,
          code,
        })),
      ),
      ...report.scores
        .filter(({ status }) => status !== "conciliada")
        .map(({ origin, responseOrigin, status }) => ({
          key: "calculo:" + origin.row + ":" + status,
          sheet: origin.sheet,
          row: origin.row,
          responseRow: responseOrigin?.row ?? null,
          code: status,
        })),
    ].sort((left, right) => left.key.localeCompare(right.key, "en"));
    const snapshot = {
      responseSheet: workbook.responseSheet,
      scoringSheet: workbook.scoringSheet,
      totals: report.totals,
      incidents,
    };
    const digest = createHash("sha256")
      .update(JSON.stringify(snapshot))
      .digest("hex");
    const key = { sourceSha256, analysisVersion, digest };
    const [created] = await tx.historicalDiagnostic.createManyAndReturn({
      data: { ...key, snapshot },
      skipDuplicates: true,
      select: { id: true },
    });
    if (created) {
      await tx.auditEvent.create({
        data: {
          actorId,
          targetId: created.id,
          action: "imports.diagnostic.registered",
        },
      });
      return created;
    }
    return tx.historicalDiagnostic.findUniqueOrThrow({
      where: { sourceSha256_analysisVersion_digest: key },
      select: { id: true },
    });
  });
}

export async function recordHistoricalReview(
  client: PrismaClient,
  actorId: string,
  diagnosticId: string,
  incidentKey: string,
  state: ReviewState,
) {
  if (state !== "observada" && state !== "requiere_revision") {
    throw new RangeError("Estado de revisión no admitido");
  }

  return client.$transaction(async (tx) => {
    await requirePermission(tx, actorId, "imports:review");
    const diagnostic = await tx.historicalDiagnostic.findUnique({
      where: { id: diagnosticId },
      select: { snapshot: true },
    });
    const snapshot = diagnostic?.snapshot;
    const incidents =
      snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
        ? snapshot.incidents
        : null;
    const found =
      Array.isArray(incidents) &&
      incidents.some(
        (incident) =>
          incident &&
          typeof incident === "object" &&
          !Array.isArray(incident) &&
          incident.key === incidentKey,
      );
    if (!found) throw new Error("Incidencia no disponible en ese diagnóstico");

    const review = await tx.historicalReview.create({
      data: { actorId, diagnosticId, incidentKey, reviewState: state },
      select: { id: true },
    });
    await tx.auditEvent.create({
      data: {
        actorId,
        targetId: diagnosticId,
        action: "imports.incident.reviewed",
      },
    });
    return review;
  });
}
