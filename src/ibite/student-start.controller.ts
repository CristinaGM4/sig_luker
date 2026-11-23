import {
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
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

@ApiTags("Mis aplicaciones IBITE")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@RequiresPermissions(["ibite:complete"])
@Controller("mis-aplicaciones-ibite")
export class IbiteStudentStartController {
  constructor(private readonly database: DatabaseService) {}

  @Post("campanas/:campanaId/iniciar")
  @HttpCode(200)
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["assignmentId"],
      properties: { assignmentId: { type: "string", format: "uuid" } },
    },
  })
  @ApiResponse({ status: 400, description: "Identificador inválido" })
  @ApiResponse({ status: 401, description: "Sesión inválida" })
  @ApiResponse({
    status: 403,
    description: "Cuenta sin acceso como estudiante",
  })
  @ApiResponse({
    status: 404,
    description: "Campaña adolescente no disponible",
  })
  @ApiResponse({
    status: 409,
    description: "Asignación previa incompatible o revocada",
  })
  async start(
    @Param("campanaId", ParseUUIDPipe) campaignId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { accountId, roles } = request.authenticatedSession.account;
    if (!roles.includes("STUDENT")) throw new ForbiddenException();
    return this.database.client.$transaction(async (tx) => {
      // Serialize starts by account, including starts in different institutions.
      await tx.$queryRaw`SELECT id FROM accounts WHERE id = ${accountId}::uuid FOR UPDATE`;
      const student = await tx.account.findFirst({
        where: {
          id: accountId,
          active: true,
          captureOnly: false,
          roles: {
            some: {
              role: {
                code: "STUDENT",
                permissions: {
                  some: { permission: { code: "ibite:complete" } },
                },
              },
            },
          },
        },
        select: { id: true },
      });
      if (!student) throw new ForbiddenException();
      await tx.$queryRaw`SELECT id FROM ibite_campaigns WHERE id = ${campaignId}::uuid FOR SHARE`;
      const now = new Date();
      const campaign = await tx.ibiteCampaign.findFirst({
        where: {
          id: campaignId,
          instrumentCode: "IBITE-17",
          variant: "ADOLESCENT",
          enabled: true,
          opensAt: { lte: now },
          closesAt: { gt: now },
          institution: { active: true },
        },
        select: { periodId: true },
      });
      if (!campaign) throw new NotFoundException();
      const existing = await tx.ibiteAssignment.findMany({
        where: {
          respondentId: accountId,
          campaign: {
            instrumentCode: "IBITE-17",
            variant: "ADOLESCENT",
            periodId: campaign.periodId,
          },
        },
        take: 2,
        select: { id: true, campaignId: true, revokedAt: true },
      });
      if (existing.length > 0) {
        const [prior] = existing;
        if (
          existing.length !== 1 ||
          prior.campaignId !== campaignId ||
          prior.revokedAt
        ) {
          throw new ConflictException(
            "Ya existe una habilitación incompatible para el periodo",
          );
        }
        return { assignmentId: prior.id };
      }
      const participant = await tx.participant.upsert({
        where: { selfAccountId: accountId },
        create: { selfAccountId: accountId },
        update: {},
        select: { id: true },
      });
      const assignment = await tx.ibiteAssignment.create({
        data: {
          campaignId,
          participantId: participant.id,
          respondentId: accountId,
        },
        select: { id: true, campaign: { select: { institutionId: true } } },
      });
      await tx.auditEvent.create({
        data: {
          actorId: accountId,
          action: "ibite.assignment.self_started",
          targetId: assignment.id,
          institutionId: assignment.campaign.institutionId,
        },
      });
      return { assignmentId: assignment.id };
    });
  }
}
