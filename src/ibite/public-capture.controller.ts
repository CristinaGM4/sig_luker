import { createHash, randomBytes } from "node:crypto";
import {
  Body,
  Controller,
  Header,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DatabaseService } from "../database/database.module.js";
import {
  SYNTHETIC_IBITE_FORM,
  SYNTHETIC_CAPTURE_KEY,
  type SyntheticIbiteForm,
} from "./capture-form.js";
import {
  captureIdentityDigest,
  readCaptureIdentity,
} from "./capture-identity.js";
import { PublicCaptureLimitGuard } from "./public-capture-limit.guard.js";

@ApiTags("Captura pública IBITE sintética")
@Controller("ibite/campanas")
export class IbitePublicCaptureController {
  constructor(
    private readonly database: DatabaseService,
    @Inject(SYNTHETIC_IBITE_FORM)
    private readonly forms: readonly SyntheticIbiteForm[],
    @Inject(SYNTHETIC_CAPTURE_KEY) private readonly secret: Buffer,
  ) {}

  @Post(":campanaId/iniciar")
  @UseGuards(PublicCaptureLimitGuard)
  @Header("Cache-Control", "no-store")
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["age", "documentNumber"],
      properties: {
        age: { type: "integer", minimum: 5, maximum: 19 },
        documentNumber: {
          type: "string",
          description:
            "Del acudiente entre 5 y 10 años. Del adolescente entre 11 y 19.",
        },
        studentName: {
          type: "string",
          description: "Requerido solo en acudiente.",
        },
        contactPhone: {
          type: "string",
          description: "Requerido solo en acudiente.",
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: "object",
      required: ["assignmentId", "token", "expiresAt"],
      properties: {
        assignmentId: { type: "string", format: "uuid" },
        token: { type: "string" },
        expiresAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Identificación inválida" })
  @ApiResponse({
    status: 429,
    description: "Límite temporal de solicitudes de inicio",
    headers: {
      "Retry-After": {
        schema: { type: "integer" },
        description: "Segundos de espera",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Campaña no disponible para esta variante",
  })
  async start(
    @Param("campanaId", ParseUUIDPipe) campaignId: string,
    @Body() body: unknown,
  ) {
    const identity = readCaptureIdentity(body);
    const token = randomBytes(32).toString("base64url");
    return this.database.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM ibite_campaigns WHERE id = ${campaignId}::uuid FOR SHARE`;
      const now = new Date();
      const campaign = await tx.ibiteCampaign.findFirst({
        where: {
          id: campaignId,
          instrumentCode: "IBITE-17",
          variant: identity.variant,
          enabled: true,
          opensAt: { lte: now },
          closesAt: { gt: now },
          institution: { active: true },
        },
        select: { sourceVersion: true, periodId: true, closesAt: true },
      });
      if (
        !campaign ||
        !this.forms.some(
          ({ variant, sourceVersion }) =>
            variant === identity.variant &&
            sourceVersion === campaign.sourceVersion,
        )
      )
        throw new NotFoundException();
      const digest = captureIdentityDigest(
        this.secret,
        campaign.periodId,
        identity,
      );
      await tx.participant.createMany({
        data: { ibiteCaptureDigest: digest },
        skipDuplicates: true,
      });
      const participant = await tx.participant.findUniqueOrThrow({
        where: { ibiteCaptureDigest: digest },
        select: { id: true },
      });
      const role = await tx.role.findUniqueOrThrow({
        where: {
          code: identity.variant === "ADOLESCENT" ? "STUDENT" : "CAREGIVER",
        },
        select: { id: true },
      });
      const expiresAt = new Date(
        Math.min(campaign.closesAt.getTime(), now.getTime() + 60 * 60 * 1000),
      );
      const account = await tx.account.create({
        data: {
          captureOnly: true,
          roles: { create: { roleId: role.id } },
          sessions: {
            create: {
              tokenDigest: createHash("sha256").update(token).digest("hex"),
              expiresAt,
            },
          },
        },
        select: { id: true },
      });
      const assignment = await tx.ibiteAssignment.create({
        data: {
          campaignId,
          participantId: participant.id,
          respondentId: account.id,
        },
        select: { id: true },
      });
      return { assignmentId: assignment.id, token, expiresAt };
    });
  }
}
