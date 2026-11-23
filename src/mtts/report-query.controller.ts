import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  RequiresPermissions,
  SessionGuard,
  type AuthenticatedRequest,
} from "../auth/session.guard.js";
import { DatabaseService } from "../database/database.module.js";
import { currentProfessionalScope } from "../ibite/professional-scope.js";
import {
  readMttsRange,
  summarizeMttsFormA,
  summarizeMttsWeeks,
} from "./form-a-summary.js";
import { mttsFormA } from "./form-a.js";

const pageSize = 25;
const summaryLimit = 2000;
const dateSchema = { type: "string", format: "date" };
const integerSchema = { type: "integer", minimum: 0 };

@ApiTags("MTTS Formato A")
@ApiBearerAuth()
@ApiResponse({
  status: 400,
  description: "Identificador, fechas o cursor inválidos",
})
@ApiResponse({ status: 401, description: "Sesión no válida" })
@ApiResponse({ status: 403, description: "Permiso insuficiente" })
@ApiResponse({
  status: 404,
  description: "Institución o cursor fuera de ámbito",
})
@UseGuards(SessionGuard)
@RequiresPermissions(["records:read"])
@Controller("interno/instituciones/:institucionId/mtts")
export class MttsReportQueryController {
  constructor(private readonly database: DatabaseService) {}

  @Get("fichas")
  @ApiQuery({ name: "desde", schema: dateSchema })
  @ApiQuery({ name: "hasta", schema: dateSchema })
  @ApiQuery({
    name: "sede",
    required: false,
    schema: { type: "string", maxLength: 160 },
  })
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiOkResponse({
    description: "Página de referencias de fichas sin contenido narrativo",
  })
  list(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Query() query: Record<string, unknown>,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.queryReports(institutionId, request, query, true);
  }

  @Get("resumen")
  @ApiQuery({ name: "desde", schema: dateSchema })
  @ApiQuery({ name: "hasta", schema: dateSchema })
  @ApiQuery({
    name: "sede",
    required: false,
    schema: { type: "string", maxLength: 160 },
  })
  @ApiQuery({
    name: "porSemana",
    required: false,
    schema: { type: "boolean", default: false },
  })
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["total", "dimensions", "barriers", "facilitators"],
      properties: {
        total: integerSchema,
        dimensions: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              distribution: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: integerSchema,
              },
              median: { type: "number", nullable: true },
              rated: integerSchema,
              notApplicable: integerSchema,
              missing: integerSchema,
              notApplicablePercent: { type: "number", nullable: true },
            },
          },
        },
        barriers: {
          type: "array",
          items: {
            type: "object",
            properties: { option: { type: "string" }, count: integerSchema },
          },
        },
        facilitators: {
          type: "array",
          items: {
            type: "object",
            properties: { option: { type: "string" }, count: integerSchema },
          },
        },
        weeks: {
          type: "array",
          items: {
            type: "object",
            properties: { weekStart: dateSchema, total: integerSchema },
            description:
              "Resumen con las mismas métricas por fecha de inicio de semana",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: "Corte demasiado amplio; reducir el intervalo",
  })
  summary(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Query() query: Record<string, unknown>,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.queryReports(institutionId, request, query, false);
  }

  private queryReports(
    institutionId: string,
    request: AuthenticatedRequest,
    query: Record<string, unknown>,
    paginated: boolean,
  ) {
    const { first, last, after, siteKey, weekly } = readMttsRange(
      query,
      paginated,
    );
    const actorId = request.authenticatedSession.account.accountId;
    const institution = {
      active: true,
      professionalAssignments: {
        some: currentProfessionalScope(actorId, "records:read"),
      },
    };
    const filter = {
      institutionId,
      institution,
      weekStart: { gte: first, lte: last },
      formVersion: mttsFormA.version,
      ...(siteKey === undefined ? {} : { siteKey }),
    };
    return this.database.client.$transaction(async (tx) => {
      if (
        !(await tx.institution.findFirst({
          where: { id: institutionId, ...institution },
          select: { id: true },
        }))
      )
        throw new NotFoundException();
      const audit = (action: string) =>
        tx.auditEvent.create({
          data: { actorId, action, targetId: institutionId, institutionId },
        });
      if (paginated) {
        const anchor = after
          ? await tx.mttsWeeklyReport.findFirst({
              where: { ...filter, id: after },
              select: { id: true, weekStart: true },
            })
          : null;
        if (after && !anchor) throw new NotFoundException();
        const rows = await tx.mttsWeeklyReport.findMany({
          where: {
            ...filter,
            ...(anchor
              ? {
                  OR: [
                    { weekStart: { lt: anchor.weekStart } },
                    { weekStart: anchor.weekStart, id: { lt: anchor.id } },
                  ],
                }
              : {}),
          },
          orderBy: [{ weekStart: "desc" }, { id: "desc" }],
          take: pageSize + 1,
          select: {
            id: true,
            site: true,
            weekStart: true,
            weekEnd: true,
            formVersion: true,
            createdAt: true,
          },
        });
        await audit("mtts.form_a.list");
        return {
          items: rows.slice(0, pageSize),
          nextCursor: rows.length > pageSize ? rows[pageSize - 1].id : null,
        };
      }
      const rows = await tx.mttsWeeklyReport.findMany({
        where: filter,
        take: summaryLimit + 1,
        select: { payload: true, weekStart: true },
      });
      if (rows.length > summaryLimit)
        throw new UnprocessableEntityException("Reduzca el intervalo MTTS");
      await audit("mtts.form_a.summary");
      const summary = summarizeMttsFormA(rows.map(({ payload }) => payload));
      return weekly ? { ...summary, weeks: summarizeMttsWeeks(rows) } : summary;
    });
  }
}
