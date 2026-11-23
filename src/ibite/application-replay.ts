import type { PrismaClient } from "../generated/prisma/client.js";
import { calculateIbiteReference } from "./reference-calculation.js";
import { prepareIbiteAnswers } from "./submission-input.js";
import { currentProfessionalScope } from "./professional-scope.js";

export async function replayIbiteApplication(
  client: PrismaClient,
  actorId: string,
  applicationId: string,
) {
  return client.$transaction(async (tx) => {
    const application = await tx.ibiteApplication.findFirst({
      where: {
        id: applicationId,
        institution: {
          professionalAssignments: {
            some: currentProfessionalScope(actorId, "records:read"),
          },
        },
      },
      select: {
        institutionId: true,
        originalResponses: true,
        provenance: true,
        instrumentVersion: true,
      },
    });
    if (!application) throw new Error("Aplicación no disponible");

    const { originalResponses, provenance } = application;
    if (
      provenance === null ||
      typeof provenance !== "object" ||
      Array.isArray(provenance) ||
      provenance.kind !== "prospective" ||
      provenance.sourceSha256 !== application.instrumentVersion.sourceSha256 ||
      originalResponses === null ||
      typeof originalResponses !== "object" ||
      Array.isArray(originalResponses)
    ) {
      throw new Error("Origen de aplicación no compatible con la reproducción");
    }
    const { items, context } = prepareIbiteAnswers(
      originalResponses.items,
      originalResponses.context,
    );
    const calculation = calculateIbiteReference(
      application.instrumentVersion,
      items,
      {
        ...context,
        present: true,
      },
    );
    await tx.auditEvent.create({
      data: {
        actorId,
        action: "ibite.application.replayed",
        targetId: applicationId,
        institutionId: application.institutionId,
      },
    });
    return calculation;
  });
}
