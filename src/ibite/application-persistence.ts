import {
  prepareIbiteAnswers,
  type SubmissionContext,
} from "./submission-input.js";
import { createHash } from "node:crypto";
import { availableIbiteAssignments } from "./available-assignments.js";
import { Prisma, type PrismaClient } from "../generated/prisma/client.js";
import { calculateIbiteReference } from "./reference-calculation.js";
import { lockOwnedAssignment } from "./assignment-lock.js";
import {
  readReportedRepresentativeAuthorization,
  type ReportedRepresentativeAuthorization,
} from "./representative-authorization.js";

interface ValidatedSubmission {
  assignmentId: string;
  idempotencyKey?: string;
  authenticatedAccountId: string;
  answers: readonly (string | null)[];
  context: SubmissionContext;
  reportedRepresentativeAuthorization?: ReportedRepresentativeAuthorization;
  acceptedFormVersion?: string;
  expectedVersion?: {
    instrumentCode: string;
    variant: string;
    sourceVersion: string;
  };
}

const acceptanceFields = {
  id: true,
  sourceVersion: true,
  appliedAt: true,
} satisfies Prisma.IbiteApplicationSelect;

export class IbiteVersionConflictError extends Error {}
export class IbiteParticipationConflictError extends Error {}

export class IbiteAssignmentUnavailableError extends Error {
  constructor() {
    super("Habilitación IBITE no disponible");
  }
}

export class IbiteSubmissionConflictError extends Error {
  constructor() {
    super("La clave ya está asociada a otro contenido");
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Persists a submission after the capture workflow validates the original
 * form, required responses, and consent for this assignment.
 */
export async function persistValidatedSubmission(
  client: PrismaClient,
  submission: ValidatedSubmission,
) {
  const { assignmentId, authenticatedAccountId } = submission;
  const { acceptedFormVersion } = submission;
  const { items: answers, context } = prepareIbiteAnswers(
    submission.answers,
    submission.context,
  );
  const key = submission.idempotencyKey;
  const reportedAuthorization = readReportedRepresentativeAuthorization(
    submission.reportedRepresentativeAuthorization,
  );
  if (
    key !== undefined &&
    (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(key))
  ) {
    throw new RangeError("Clave de reintento inválida");
  }
  const idempotencyKeyDigest = key === undefined ? null : digest(key);
  const payload = {
    items: answers,
    context,
    ...(reportedAuthorization === undefined
      ? {}
      : {
          reportedRepresentativeAuthorization: reportedAuthorization,
        }),
    ...(acceptedFormVersion === undefined
      ? {}
      : {
          participation: "accepted",
          formVersion: acceptedFormVersion,
        }),
  };
  const fingerprint = [answers, context];
  const digestInput =
    acceptedFormVersion !== undefined
      ? [...fingerprint, reportedAuthorization, acceptedFormVersion]
      : reportedAuthorization !== undefined
        ? [...fingerprint, reportedAuthorization]
        : fingerprint;
  const requestDigest =
    key === undefined ? null : digest(JSON.stringify(digestInput));

  const execute = (conflict?: Prisma.PrismaClientKnownRequestError) =>
    client.$transaction(async (tx) => {
      if (
        !(await lockOwnedAssignment(tx, assignmentId, authenticatedAccountId))
      ) {
        throw new IbiteAssignmentUnavailableError();
      }
      const appliedAt = new Date();
      const assignment = await tx.ibiteAssignment.findFirst({
        where: {
          id: assignmentId,
          ...availableIbiteAssignments(authenticatedAccountId, appliedAt),
        },
        select: {
          refusal: { select: { assignmentId: true } },
          participantId: true,
          campaign: {
            select: {
              institutionId: true,
              periodId: true,
              instrumentVersion: true,
            },
          },
        },
      });
      if (!assignment) throw new IbiteAssignmentUnavailableError();
      if (assignment.refusal) throw new IbiteParticipationConflictError();
      const { institutionId, periodId, instrumentVersion } =
        assignment.campaign;
      const expected = submission.expectedVersion;
      if (
        expected &&
        (expected.instrumentCode !== instrumentVersion.instrumentCode ||
          expected.variant !== instrumentVersion.variant ||
          expected.sourceVersion !== instrumentVersion.sourceVersion)
      ) {
        throw new IbiteVersionConflictError();
      }
      if (
        reportedAuthorization !== undefined &&
        (instrumentVersion.instrumentCode !== "IBITE-17" ||
          instrumentVersion.variant !== "ADOLESCENT")
      ) {
        throw new RangeError(
          "Autorización declarada disponible solo en IBITE-17 adolescente",
        );
      }
      if (idempotencyKeyDigest) {
        const prior = await tx.ibiteApplication.findUnique({
          where: {
            assignmentId_idempotencyKeyDigest: {
              assignmentId,
              idempotencyKeyDigest,
            },
          },
          select: { ...acceptanceFields, requestDigest: true },
        });
        if (prior) {
          if (prior.requestDigest !== requestDigest)
            throw new IbiteSubmissionConflictError();
          return {
            id: prior.id,
            sourceVersion: prior.sourceVersion,
            appliedAt: prior.appliedAt,
          };
        }
      }
      if (conflict) throw conflict;

      const {
        instrumentCode,
        variant,
        sourceVersion,
        sourceSha256,
        ruleVersion,
      } = instrumentVersion;
      const calculation = calculateIbiteReference(instrumentVersion, answers, {
        ...context,
        present: true,
      });
      const created = await tx.ibiteApplication.create({
        data: {
          assignmentId,
          idempotencyKeyDigest,
          requestDigest,
          participantId: assignment.participantId,
          respondentId: authenticatedAccountId,
          institutionId,
          periodId,
          appliedAt,
          instrumentCode,
          variant,
          sourceVersion,
          provenance: { kind: "prospective", sourceSha256 },
          originalResponses: payload,
          results: {
            create: {
              ruleVersion,
              provenance: { kind: "calculated", sourceSha256 },
              result: {
                ...calculation,
                reference: { ...calculation.reference },
              },
            },
          },
        },
        select: acceptanceFields,
      });
      await tx.auditEvent.create({
        data: {
          actorId: authenticatedAccountId,
          action: "ibite.application.finalized",
          targetId: created.id,
          institutionId,
        },
      });
      return created;
    });
  try {
    return await execute();
  } catch (error) {
    if (
      idempotencyKeyDigest &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return execute(error);
    }
    throw error;
  }
}
