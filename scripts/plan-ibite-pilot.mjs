import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL, URL } from "node:url";
import { createDatabaseClient } from "../dist/database/database-client.js";

const variants = ["ADOLESCENT", "CAREGIVER"];
const normalizeName = (name) =>
  name.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

export function planPilot(
  config,
  { period, institutions, versions, campaigns, operator },
) {
  const opensAt = new Date(config.opensAt);
  const closesAt = new Date(config.closesAtExclusive);
  if (
    !(opensAt < closesAt) ||
    config.instrumentCode !== "IBITE-17" ||
    config.institutions.length !== 10 ||
    new Set(config.institutions.map(normalizeName)).size !== 10
  ) {
    throw new Error("Configuración del piloto IBITE-17 inválida");
  }
  const blockers = [];
  if (operator === null) blockers.push({ reason: "operator_not_authorized" });
  if (!period) blockers.push({ reason: "period_not_found" });
  if (
    period &&
    (period.label !== config.periodLabel ||
      period.startsOn.toISOString().slice(0, 10) > config.startDate ||
      period.endsOn.toISOString().slice(0, 10) < config.endDateInclusive)
  )
    blockers.push({ reason: "period_mismatch" });
  const references = new Map();
  for (const variant of variants) {
    const matches = versions.filter(
      (version) =>
        version.variant === variant &&
        version.sourceVersion === config.sourceVersion,
    );
    if (matches.length === 1) references.set(variant, matches[0]);
    else blockers.push({ reason: "reference_not_found", variant });
  }
  const entries = [];
  for (const institutionName of config.institutions) {
    const matches = institutions.filter(
      ({ name }) => normalizeName(name) === normalizeName(institutionName),
    );
    if (matches.length !== 1 || !matches[0].active) {
      blockers.push({
        institutionName,
        reason:
          matches.length !== 1
            ? matches.length
              ? "institution_ambiguous"
              : "institution_not_found"
            : "institution_inactive",
      });
      continue;
    }
    const institution = matches[0];
    if (
      operator &&
      !operator.institutions.some(
        ({ institutionId }) => institutionId === institution.id,
      )
    ) {
      blockers.push({ reason: "operator_out_of_scope", institutionName });
    }
    for (const variant of variants) {
      const reference = references.get(variant);
      if (!period || !reference) continue;
      const existing = campaigns.filter(
        (campaign) =>
          campaign.institutionId === institution.id &&
          campaign.variant === variant,
      );
      const [current] = existing;
      const matchesPlan =
        current &&
        current.sourceVersion === reference.sourceVersion &&
        current.opensAt.getTime() === opensAt.getTime() &&
        current.closesAt.getTime() === closesAt.getTime();
      const status =
        existing.length === 0
          ? "pending"
          : existing.length === 1 && matchesPlan
            ? "configured"
            : "conflict";
      if (status === "conflict")
        blockers.push({
          reason: "campaign_conflict",
          institutionName,
          variant,
        });
      entries.push({
        institutionName,
        institutionCode: institution.code,
        variant,
        sourceVersion: reference.sourceVersion,
        status,
        campaignId: status === "configured" ? current.id : null,
        enabled: status === "configured" ? current.enabled : null,
      });
    }
  }
  return {
    periodCode: period?.code ?? null,
    opensAt,
    closesAt,
    operatorChecked: operator !== undefined,
    blockers,
    entries,
  };
}

async function main() {
  const [periodCode, operatorId, mode, extra] = process.argv.slice(2);
  const deploymentPlan = mode === "--deployment-plan";
  const url = deploymentPlan
    ? process.env.IBITE_PLAN_DATABASE_URL
    : process.env.DATABASE_TEST_URL;
  if (
    !periodCode ||
    !url ||
    extra ||
    (mode !== undefined && !deploymentPlan) ||
    (deploymentPlan && !operatorId)
  )
    throw new Error(
      "Indica el código del periodo, la URL y el operador si revisas un despliegue",
    );
  if (
    operatorId &&
    !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(operatorId)
  ) {
    throw new Error("El identificador del operador debe ser UUID");
  }
  const target = new URL(url);
  if (
    !["postgresql:", "postgres:"].includes(target.protocol) ||
    (!deploymentPlan &&
      (target.hostname !== "127.0.0.1" || target.pathname !== "/sig_test"))
  ) {
    throw new Error("El ensayo de preparación requiere sig_test en 127.0.0.1");
  }
  const config = JSON.parse(
    await readFile(
      new URL(
        "../docs/02-requerimientos/ibite17-piloto-periodo-2.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const client = createDatabaseClient(url);
  try {
    const snapshot = await client.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET TRANSACTION READ ONLY`;
        const period = await tx.academicPeriod.findUnique({
          where: { code: periodCode },
        });
        const institutions = await tx.institution.findMany({
          select: { id: true, code: true, name: true, active: true },
        });
        const versions = await tx.instrumentVersion.findMany({
          where: { instrumentCode: config.instrumentCode },
        });
        const campaigns = period
          ? await tx.ibiteCampaign.findMany({
              where: {
                instrumentCode: config.instrumentCode,
                periodId: period.id,
              },
            })
          : [];
        const operator = operatorId
          ? await tx.account.findFirst({
              where: {
                id: operatorId,
                active: true,
                roles: {
                  some: {
                    role: {
                      permissions: {
                        some: {
                          permission: { code: "ibite:campaign-control" },
                        },
                      },
                    },
                  },
                },
              },
              select: { institutions: { select: { institutionId: true } } },
            })
          : undefined;
        return { period, institutions, versions, campaigns, operator };
      },
      { isolationLevel: "RepeatableRead" },
    );
    const report = planPilot(config, snapshot);
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    if (report.blockers.length) process.exitCode = 2;
  } finally {
    await client.$disconnect();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
  });
}
