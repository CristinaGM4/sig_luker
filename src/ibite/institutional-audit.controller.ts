import { readAfter } from "./query-cursor.js";
import { currentProfessionalScope } from "./professional-scope.js";
import {
  Controller,
  ForbiddenException,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Req,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RequiresPermissions, SessionGuard } from "../auth/session.guard.js";
import type { AuthenticatedRequest } from "../auth/session.guard.js";
import { DatabaseService } from "../database/database.module.js";

const limit = 25;

@ApiTags("Auditoría institucional")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@RequiresPermissions(["audit:read"])
@Controller("interno/instituciones")
export class InstitutionalAuditController {
  constructor(private readonly database: DatabaseService) {}

  @Get(":institucionId/auditoria")
  @Header("Cache-Control", "no-store")
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiResponse({ status: 400, description: "Identificador inválido" })
  @ApiResponse({ status: 401, description: "Sesión inválida o ausente" })
  @ApiResponse({ status: 403, description: "Rol o permiso insuficiente" })
  @ApiResponse({
    status: 404,
    description: "Institución fuera de ámbito o inexistente",
  })
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["institutionId", "items", "truncated", "nextCursor"],
      properties: {
        institutionId: { type: "string", format: "uuid" },
        truncated: { type: "boolean" },
        nextCursor: { type: "string", format: "uuid", nullable: true },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "actorId", "action", "targetId", "occurredAt"],
            properties: {
              id: { type: "string", format: "uuid" },
              actorId: { type: "string", format: "uuid" },
              action: { type: "string" },
              targetId: { type: "string", format: "uuid" },
              occurredAt: { type: "string", format: "date-time" },
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
    const { accountId, roles } = request.authenticatedSession.account;
    if (!roles.includes("PSYCHOSOCIAL_SUPPORT")) throw new ForbiddenException();

    return this.database.client.$transaction(async (tx) => {
      const scope = await tx.professionalInstitution.findFirst({
        where: {
          institutionId,
          ...currentProfessionalScope(accountId, "audit:read"),
        },
        select: { institutionId: true },
      });
      if (!scope) throw new NotFoundException();

      const anchor = after
        ? await tx.auditEvent.findFirst({
            where: { id: after, institutionId },
            select: { id: true, occurredAt: true },
          })
        : null;
      if (after && !anchor) throw new NotFoundException();

      const events = await tx.auditEvent.findMany({
        where: {
          institutionId: scope.institutionId,
          ...(anchor
            ? {
                OR: [
                  { occurredAt: { lt: anchor.occurredAt } },
                  { occurredAt: anchor.occurredAt, id: { lt: anchor.id } },
                ],
              }
            : {}),
        },
        orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        select: {
          id: true,
          actorId: true,
          action: true,
          targetId: true,
          occurredAt: true,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: accountId,
          action: "audit.institution.read",
          targetId: institutionId,
          institutionId,
        },
      });

      return {
        institutionId,
        items: events.slice(0, limit),
        truncated: events.length > limit,
        nextCursor: events.length > limit ? events[limit - 1].id : null,
      };
    });
  }
}
