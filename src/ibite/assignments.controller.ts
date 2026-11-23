import { readAfter } from "./query-cursor.js";
import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RequiresPermissions, SessionGuard } from "../auth/session.guard.js";
import type { AuthenticatedRequest } from "../auth/session.guard.js";
import { DatabaseService } from "../database/database.module.js";

@ApiTags("Asignaciones psicosociales")
@ApiBearerAuth()
@ApiResponse({ status: 400, description: "Identificador inválido" })
@ApiResponse({ status: 401, description: "Sesión inválida" })
@ApiResponse({ status: 403, description: "Permiso insuficiente" })
@UseGuards(SessionGuard)
@RequiresPermissions(["scope:manage"])
@Controller("interno/asignaciones-psicosociales")
export class AssignmentsController {
  constructor(private readonly database: DatabaseService) {}

  @Get("instituciones/:institucionId")
  @Header("Cache-Control", "no-store")
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiResponse({ status: 404, description: "Institución inexistente" })
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["institutionId", "items", "nextCursor"],
      properties: {
        institutionId: { type: "string", format: "uuid" },
        nextCursor: { type: "string", format: "uuid", nullable: true },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["professionalId", "revokedAt"],
            properties: {
              professionalId: { type: "string", format: "uuid" },
              revokedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
            },
          },
        },
      },
    },
  })
  async list(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const after = readAfter(query);
    const { accountId: actorId } = request.authenticatedSession.account;
    return this.database.client.$transaction(async (tx) => {
      const institution = await tx.institution.findUnique({
        where: { id: institutionId },
        select: { id: true },
      });
      if (!institution) throw new NotFoundException();
      const rows = await tx.professionalInstitution.findMany({
        where: {
          institutionId,
          ...(after ? { professionalId: { gt: after } } : {}),
        },
        orderBy: { professionalId: "asc" },
        take: 26,
        select: { professionalId: true, revokedAt: true },
      });
      await tx.auditEvent.create({
        data: {
          actorId,
          action: "scope.listed",
          targetId: institutionId,
          institutionId,
        },
      });
      return {
        institutionId,
        items: rows.slice(0, 25),
        nextCursor: rows.length > 25 ? rows[24].professionalId : null,
      };
    });
  }

  @Put(":profesionalId/:institucionId")
  @HttpCode(204)
  @ApiNoContentResponse({ description: "Asignación vigente" })
  @ApiResponse({
    status: 404,
    description: "Profesional o institución no elegibles",
  })
  async grant(
    @Param("profesionalId", ParseUUIDPipe) professionalId: string,
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { accountId: actorId } = request.authenticatedSession.account;
    await this.database.client.$transaction(async (tx) => {
      const [professional, institution] = await Promise.all([
        tx.account.findFirst({
          where: {
            id: professionalId,
            active: true,
            roles: { some: { role: { code: "PSYCHOSOCIAL_SUPPORT" } } },
          },
          select: { id: true },
        }),
        tx.institution.findUnique({
          where: { id: institutionId },
          select: { id: true },
        }),
      ]);
      if (!professional || !institution) throw new NotFoundException();
      const key = { professionalId, institutionId };
      const inserted = await tx.professionalInstitution.createMany({
        data: key,
        skipDuplicates: true,
      });
      const reactivated = inserted.count
        ? 0
        : (
            await tx.professionalInstitution.updateMany({
              where: { ...key, revokedAt: { not: null } },
              data: { revokedAt: null },
            })
          ).count;
      if (inserted.count || reactivated) {
        await tx.auditEvent.create({
          data: {
            actorId,
            action: "scope.granted",
            targetId: professionalId,
            institutionId,
          },
        });
      }
    });
  }

  @Delete(":profesionalId/:institucionId")
  @HttpCode(204)
  @ApiNoContentResponse({ description: "Asignación revocada o inexistente" })
  async revoke(
    @Param("profesionalId", ParseUUIDPipe) professionalId: string,
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { accountId: actorId } = request.authenticatedSession.account;
    await this.database.client.$transaction(async (tx) => {
      const change = await tx.professionalInstitution.updateMany({
        where: { professionalId, institutionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (change.count) {
        await tx.auditEvent.create({
          data: {
            actorId,
            action: "scope.revoked",
            targetId: professionalId,
            institutionId,
          },
        });
      }
    });
  }
}
