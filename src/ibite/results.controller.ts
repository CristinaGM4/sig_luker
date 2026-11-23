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

@ApiTags("Resultados IBITE internos")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@RequiresPermissions(["records:read"])
@Controller("interno/aplicaciones-ibite")
export class ResultsController {
  constructor(private readonly database: DatabaseService) {}

  @Get(":aplicacionId/resultados")
  @Header("Cache-Control", "no-store")
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiResponse({ status: 400, description: "Identificador inválido" })
  @ApiResponse({ status: 401, description: "Sesión inválida" })
  @ApiResponse({ status: 403, description: "Rol o permiso insuficiente" })
  @ApiResponse({
    status: 404,
    description: "Aplicación fuera de ámbito o inexistente",
  })
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["applicationId", "results", "truncated", "nextCursor"],
      properties: {
        applicationId: { type: "string", format: "uuid" },
        truncated: { type: "boolean" },
        nextCursor: { type: "string", format: "uuid", nullable: true },
        results: {
          type: "array",
          items: {
            type: "object",
            required: [
              "id",
              "ruleVersion",
              "calculatedAt",
              "provenance",
              "result",
            ],
            properties: {
              id: { type: "string", format: "uuid" },
              ruleVersion: { type: "string" },
              calculatedAt: { type: "string", format: "date-time" },
              provenance: {},
              result: {},
            },
          },
        },
      },
    },
  })
  async listResults(
    @Param("aplicacionId", ParseUUIDPipe) applicationId: string,
    @Req() request: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const after = readAfter(query);
    const { accountId, roles } = request.authenticatedSession.account;
    if (!roles.includes("PSYCHOSOCIAL_SUPPORT")) {
      throw new ForbiddenException();
    }

    const application = await this.database.client.$transaction(async (tx) => {
      const scoped = await tx.ibiteApplication.findFirst({
        where: {
          id: applicationId,
          institution: {
            professionalAssignments: {
              some: currentProfessionalScope(accountId, "records:read"),
            },
          },
        },
        select: { institutionId: true },
      });
      if (!scoped) throw new NotFoundException();
      const anchor = after
        ? await tx.ibiteResult.findFirst({
            where: { id: after, applicationId },
            select: { id: true, calculatedAt: true },
          })
        : null;
      if (after && !anchor) throw new NotFoundException();

      const results = await tx.ibiteResult.findMany({
        where: {
          applicationId,
          ...(anchor
            ? {
                OR: [
                  { calculatedAt: { lt: anchor.calculatedAt } },
                  { calculatedAt: anchor.calculatedAt, id: { lt: anchor.id } },
                ],
              }
            : {}),
        },
        take: 26,
        orderBy: [{ calculatedAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          ruleVersion: true,
          calculatedAt: true,
          provenance: true,
          result: true,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: accountId,
          action: "ibite.results.read",
          targetId: applicationId,
          institutionId: scoped.institutionId,
        },
      });
      return results;
    });
    return {
      applicationId,
      results: application.slice(0, 25),
      truncated: application.length > 25,
      nextCursor: application.length > 25 ? application[24].id : null,
    };
  }
}
