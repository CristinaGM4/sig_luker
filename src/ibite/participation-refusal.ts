import type {
  IbiteRefusalReason,
  PrismaClient,
} from "../generated/prisma/client.js";
import { lockOwnedAssignment } from "./assignment-lock.js";
import {
  IbiteAssignmentUnavailableError,
  IbiteParticipationConflictError,
} from "./application-persistence.js";
import { availableIbiteAssignments } from "./available-assignments.js";
import type { SyntheticIbiteForm } from "./capture-form.js";

export async function recordParticipationRefusal(
  client: PrismaClient,
  id: string,
  accountId: string,
  form: SyntheticIbiteForm,
  reason: IbiteRefusalReason,
) {
  return client.$transaction(async (tx) => {
    if (!(await lockOwnedAssignment(tx, id, accountId))) {
      throw new IbiteAssignmentUnavailableError();
    }
    const { instrumentCode, variant, sourceVersion, formVersion } = form;
    const assignment = await tx.ibiteAssignment.findFirst({
      where: {
        id,
        ...availableIbiteAssignments(accountId, new Date()),
        AND: { campaign: { instrumentCode, variant, sourceVersion } },
      },
      select: {
        refusal: {
          select: { formVersion: true, reason: true, recordedAt: true },
        },
        applications: { select: { id: true }, take: 1 },
        campaign: { select: { institutionId: true } },
      },
    });
    if (!assignment) throw new IbiteAssignmentUnavailableError();
    if (
      assignment.applications.length ||
      (assignment.refusal &&
        (assignment.refusal.formVersion !== formVersion ||
          assignment.refusal.reason !== reason))
    ) {
      throw new IbiteParticipationConflictError();
    }
    if (assignment.refusal) return assignment.refusal;
    const refusal = await tx.ibiteParticipationRefusal.create({
      data: { assignmentId: id, formVersion, reason },
      select: { formVersion: true, reason: true, recordedAt: true },
    });
    await tx.auditEvent.create({
      data: {
        actorId: accountId,
        action:
          reason === "PARTICIPATION"
            ? "ibite.participation.declined"
            : "ibite.authorization.declined",
        targetId: id,
        institutionId: assignment.campaign.institutionId,
      },
    });
    return refusal;
  });
}
