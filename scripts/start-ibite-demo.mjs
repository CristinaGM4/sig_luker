import process from "node:process";
import { createApp } from "../dist/app.js";
import { SessionService } from "../dist/auth/session.service.js";
import { readIbiteDemoConfig } from "../dist/config.js";
import { seedAccessCatalog } from "../dist/database/access-catalog.js";
import { DatabaseService } from "../dist/database/database.module.js";
import { seedInstrumentCatalog } from "../dist/database/instrument-catalog.js";
import {
  caregiverForm,
  syntheticIbiteForm,
  verifiedIbiteForms,
} from "../test/fixtures/ibite-synthetic-form.mjs";

const institutionCode = "DEMO-IBITE-LOCAL";
const periodCode = "DEMO-IBITE-LOCAL";
const reviewerId = "3ca843a0-bd5f-4fc0-9c71-51ddc6150100";
const forms = process.argv.includes("--verified-items")
  ? verifiedIbiteForms
  : [syntheticIbiteForm, caregiverForm];

async function main() {
  const config = readIbiteDemoConfig(process.env);
  const app = await createApp(
    true,
    config.databaseUrl,
    forms,
    config.captureKey,
  );
  try {
    const { client } = app.get(DatabaseService);
    await seedAccessCatalog(client);
    const campaigns = await client.$transaction(async (tx) => {
      await seedInstrumentCatalog(tx);
      const institution = await tx.institution.upsert({
        where: { code: institutionCode },
        create: {
          code: institutionCode,
          name: "Institución ficticia para demostración IBITE",
        },
        update: {},
      });
      const now = Date.now();
      const period = await tx.academicPeriod.upsert({
        where: { code: periodCode },
        create: {
          code: periodCode,
          label: "Periodo ficticio IBITE",
          startsOn: new Date(now - 86_400_000),
          endsOn: new Date(now + 86_400_000),
        },
        update: {},
      });
      const role = await tx.role.findUniqueOrThrow({
        where: { code: "PSYCHOSOCIAL_SUPPORT" },
        select: { id: true },
      });
      await tx.account.upsert({
        where: { id: reviewerId },
        create: { id: reviewerId, roles: { create: { roleId: role.id } } },
        update: {},
      });
      await tx.professionalInstitution.upsert({
        where: {
          professionalId_institutionId: {
            professionalId: reviewerId,
            institutionId: institution.id,
          },
        },
        create: { professionalId: reviewerId, institutionId: institution.id },
        update: {},
      });
      const result = [];
      for (const { instrumentCode, variant, sourceVersion } of forms) {
        const id =
          "3ca843a0-bd5f-4fc0-9c71-51ddc615010" +
          (variant === "ADOLESCENT" ? "1" : "2");
        const { enabled, opensAt, closesAt } = await tx.ibiteCampaign.upsert({
          where: { id },
          create: {
            id,
            institutionId: institution.id,
            periodId: period.id,
            instrumentCode,
            variant,
            sourceVersion,
            opensAt: new Date(now - 60_000),
            closesAt: new Date(now + 86_400_000),
          },
          update: {},
        });
        result.push({ id, variant, enabled, opensAt, closesAt });
      }
      return result;
    });
    const session = await app
      .get(SessionService)
      .issue(reviewerId, new Date(Date.now() + 60 * 60 * 1000));
    app.enableShutdownHooks();
    await app.listen(config.port, config.host);
    // Only for this loopback demo. The token belongs to a synthetic user.
    process.stdout.write(
      "IBITE_DEMO " +
        JSON.stringify({
          baseUrl: await app.getUrl(),
          campaigns,
          psychosocialToken: session.token,
        }) +
        "\n",
    );
  } catch (error) {
    await app.close();
    throw error;
  }
}

main().catch((error) => {
  process.stderr.write("Error en demo IBITE: " + error.message + "\n");
  process.exitCode = 1;
});
