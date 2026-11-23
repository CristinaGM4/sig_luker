import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  RequiresPermissions,
  SessionGuard,
  type AuthenticatedRequest,
} from "../auth/session.guard.js";
import { DatabaseService } from "../database/database.module.js";
import { Prisma } from "../generated/prisma/client.js";
import {
  IbiteAssignmentUnavailableError,
  IbiteParticipationConflictError,
  IbiteSubmissionConflictError,
  IbiteVersionConflictError,
  persistValidatedSubmission,
} from "./application-persistence.js";
import { availableIbiteAssignments } from "./available-assignments.js";
import {
  SYNTHETIC_IBITE_FORM,
  readSyntheticRefusal,
  readSyntheticSubmission,
  type SyntheticIbiteForm,
} from "./capture-form.js";
import { recordParticipationRefusal } from "./participation-refusal.js";

const answerProperties = {
  questionId: { type: "string" },
  optionId: { type: "string" },
};

@ApiTags("Captura IBITE sintética")
@ApiBearerAuth()
@ApiResponse({ status: 400, description: "Solicitud inválida" })
@ApiResponse({ status: 401, description: "Sesión inválida" })
@ApiResponse({ status: 403, description: "Permiso insuficiente" })
@ApiResponse({
  status: 404,
  description: "Formulario o habilitación no disponible",
})
@UseGuards(SessionGuard)
@RequiresPermissions(["ibite:complete"])
@Controller("mis-aplicaciones-ibite")
export class IbiteCaptureController {
  constructor(
    private readonly database: DatabaseService,
    @Inject(SYNTHETIC_IBITE_FORM)
    private readonly configuredForms: readonly SyntheticIbiteForm[],
  ) {}

  private async findForm(id: string, accountId: string) {
    const availability = availableIbiteAssignments(accountId, new Date());
    const found = await this.database.client.ibiteAssignment.findFirst({
      where: {
        ...availability,
        id,
      },
      select: {
        refusal: { select: { reason: true } },
        campaign: {
          select: { instrumentCode: true, variant: true, sourceVersion: true },
        },
      },
    });
    if (!found) throw new NotFoundException();
    const form = this.configuredForms.find(
      (candidate) =>
        candidate.instrumentCode === found.campaign.instrumentCode &&
        candidate.variant === found.campaign.variant &&
        candidate.sourceVersion === found.campaign.sourceVersion,
    );
    if (!form) throw new NotFoundException();
    return {
      form,
      participationDeclined: found.refusal !== null,
      refusalReason: found.refusal?.reason ?? null,
    };
  }

  @Get(":habilitacionId/formulario")
  @ApiOkResponse({
    schema: {
      type: "object",
      required: [
        "formVersion",
        "instrumentCode",
        "variant",
        "sourceVersion",
        "questions",
        "participationOptions",
        "participationDeclined",
        "refusalReason",
        "authorizationOptions",
      ],
      properties: {
        formVersion: { type: "string" },
        instrumentCode: { type: "string" },
        variant: { type: "string" },
        sourceVersion: { type: "string" },
        participationOptions: {
          type: "array",
          items: { type: "string", enum: ["accepted", "declined"] },
        },
        participationDeclined: { type: "boolean" },
        refusalReason: {
          type: "string",
          nullable: true,
          enum: ["PARTICIPATION", "REPRESENTATIVE_AUTHORIZATION", null],
        },
        authorizationOptions: {
          type: "array",
          items: { type: "string", enum: ["authorized", "unknown"] },
        },
        questions: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "text", "options"],
            properties: {
              id: { type: "string" },
              text: { type: "string" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "text"],
                  properties: {
                    id: { type: "string" },
                    text: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async form(
    @Param("habilitacionId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { form, participationDeclined, refusalReason } = await this.findForm(
      id,
      request.authenticatedSession.account.accountId,
    );
    return {
      ...form,
      participationDeclined,
      refusalReason,
      participationOptions: ["accepted", "declined"],
      authorizationOptions:
        form.variant === "ADOLESCENT" ? ["authorized", "unknown"] : [],
      questions: form.questions.map(({ id, text, options }) => ({
        id,
        text,
        options: options.map(({ id, text }) => ({ id, text })),
      })),
    };
  }

  @Post(":habilitacionId/negativa")
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["formVersion"],
      properties: {
        formVersion: { type: "string" },
        reason: {
          type: "string",
          enum: ["PARTICIPATION", "REPRESENTATIVE_AUTHORIZATION"],
          default: "PARTICIPATION",
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: "object",
      required: ["assignmentId", "formVersion", "recordedAt", "reason"],
      properties: {
        assignmentId: { type: "string", format: "uuid" },
        formVersion: { type: "string" },
        recordedAt: { type: "string", format: "date-time" },
        reason: {
          type: "string",
          enum: ["PARTICIPATION", "REPRESENTATIVE_AUTHORIZATION"],
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: "Decisión o versión en conflicto" })
  @ApiResponse({
    status: 422,
    description: "Motivo no disponible para la variante",
  })
  async decline(
    @Param("habilitacionId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const accountId = request.authenticatedSession.account.accountId;
    const { form } = await this.findForm(id, accountId);
    const { formVersion, reason } = readSyntheticRefusal(body, form);
    if (formVersion !== form.formVersion) {
      throw new ConflictException("Versión de formulario no vigente");
    }
    try {
      const refusal = await recordParticipationRefusal(
        this.database.client,
        id,
        accountId,
        form,
        reason,
      );
      return { assignmentId: id, ...refusal };
    } catch (error) {
      if (error instanceof IbiteAssignmentUnavailableError)
        throw new NotFoundException();
      if (error instanceof IbiteParticipationConflictError)
        throw new ConflictException("Decisión en conflicto");
      throw error;
    }
  }

  @Post(":habilitacionId/envios")
  @ApiHeader({
    name: "Idempotency-Key",
    required: true,
    schema: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
  })
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["formVersion", "participation", "answers"],
      properties: {
        formVersion: { type: "string" },
        participation: { type: "string", enum: ["accepted"] },
        reportedRepresentativeAuthorization: {
          type: "string",
          enum: ["authorized", "unknown"],
          description: "Obligatoria en adolescente. Se omite en acudiente.",
        },
        answers: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: Object.keys(answerProperties),
            properties: answerProperties,
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: "object",
      required: [
        "applicationId",
        "assignmentId",
        "sourceVersion",
        "submittedAt",
      ],
      properties: {
        applicationId: { type: "string", format: "uuid" },
        assignmentId: { type: "string", format: "uuid" },
        sourceVersion: { type: "string" },
        submittedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Versión, reintento o aplicación definitiva en conflicto",
  })
  @ApiResponse({
    status: 422,
    description: "Respuesta o decisión inválida para el formulario sintético",
  })
  async submit(
    @Param("habilitacionId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: unknown,
  ) {
    const accountId = request.authenticatedSession.account.accountId;
    const { form } = await this.findForm(id, accountId);
    if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) {
      throw new BadRequestException("Clave de reintento inválida");
    }
    const { formVersion, ...prepared } = readSyntheticSubmission(body, form);
    if (formVersion !== form.formVersion) {
      throw new ConflictException("Versión de formulario no vigente");
    }
    try {
      const application = await persistValidatedSubmission(
        this.database.client,
        {
          ...prepared,
          assignmentId: id,
          authenticatedAccountId: accountId,
          expectedVersion: form,
          idempotencyKey: key,
          acceptedFormVersion: formVersion,
        },
      );
      return {
        applicationId: application.id,
        assignmentId: id,
        sourceVersion: application.sourceVersion,
        submittedAt: application.appliedAt,
      };
    } catch (error) {
      if (error instanceof IbiteAssignmentUnavailableError)
        throw new NotFoundException();
      if (
        error instanceof IbiteSubmissionConflictError ||
        error instanceof IbiteParticipationConflictError ||
        error instanceof IbiteVersionConflictError ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002")
      ) {
        throw new ConflictException("Envío en conflicto");
      }
      throw error;
    }
  }
}
