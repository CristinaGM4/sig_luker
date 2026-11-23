import {
  Body,
  ConflictException,
  Controller,
  Get,
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
import { currentProfessionalScope } from "../ibite/professional-scope.js";
import { mttsFormA, parseMttsFormA } from "./form-a.js";

const receiptProperties = {
  id: { type: "string", format: "uuid" },
  formVersion: { type: "string" },
  createdAt: { type: "string", format: "date-time" },
};
const receiptFields = { id: true, formVersion: true, createdAt: true } as const;
const text = { type: "string" };
const textList = { type: "array", items: text };

@ApiTags("MTTS Formato A")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@ApiResponse({ status: 401, description: "Sesión no válida" })
@ApiResponse({ status: 403, description: "Permiso insuficiente" })
@ApiResponse({
  status: 404,
  description: "Recurso fuera de ámbito o inexistente",
})
@Controller("interno/instituciones/:institucionId/mtts")
export class MttsFormAController {
  constructor(private readonly database: DatabaseService) {}

  @Get("formato-a")
  @RequiresPermissions(["records:create"])
  @ApiOkResponse({ description: "Definición versionada del Formato A" })
  async definition(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const accountId = request.authenticatedSession.account.accountId;
    const institution = await this.database.client.institution.findFirst({
      where: {
        id: institutionId,
        active: true,
        professionalAssignments: {
          some: currentProfessionalScope(accountId, "records:create"),
        },
      },
      select: { id: true },
    });
    if (!institution) throw new NotFoundException();
    return mttsFormA;
  }

  @Post("fichas")
  @RequiresPermissions(["records:create"])
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "version",
        "site",
        "weekStart",
        "weekEnd",
        "role",
        "activities",
        "countsUnavailable",
        "ratings",
        "barriers",
        "facilitators",
        "adjustment",
        "status",
        "escalation",
      ],
      properties: {
        version: text,
        site: text,
        weekStart: { type: "string", format: "date" },
        weekEnd: { type: "string", format: "date" },
        role: text,
        activities: textList,
        counts: { type: "object" },
        countsUnavailable: { type: "boolean" },
        ratings: { type: "object" },
        barriers: { ...textList, maxItems: 3 },
        facilitators: { ...textList, maxItems: 3 },
        adjustment: text,
        status: text,
        escalation: { type: "boolean" },
        roleDetail: text,
        activityDetail: text,
        barrierDetail: text,
        mainBarrier: text,
        facilitatorDetail: text,
        mainFacilitator: text,
        adjustmentDetail: text,
        escalationTopic: text,
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: "object",
      properties: receiptProperties,
      required: Object.keys(receiptFields),
    },
  })
  @ApiResponse({ status: 400, description: "Datos del Formato A inválidos" })
  @ApiResponse({
    status: 409,
    description: "Ficha ya registrada para esa unidad semanal",
  })
  async submit(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const authorId = request.authenticatedSession.account.accountId;
    const { site, weekStart, weekEnd, version, payload } = parseMttsFormA(body);
    try {
      return await this.database.client.$transaction(async (tx) => {
        const scope = await tx.professionalInstitution.findFirst({
          where: {
            institutionId,
            institution: { active: true },
            ...currentProfessionalScope(authorId, "records:create"),
          },
          select: { institutionId: true },
        });
        if (!scope) throw new NotFoundException();
        const row = await tx.mttsWeeklyReport.create({
          data: {
            institutionId,
            authorId,
            site,
            siteKey: site.toLowerCase(),
            weekStart,
            weekEnd,
            formVersion: version,
            payload,
          },
          select: receiptFields,
        });
        await tx.auditEvent.create({
          data: {
            actorId: authorId,
            action: "mtts.form_a.submitted",
            targetId: row.id,
            institutionId,
          },
        });
        return row;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException(
          "Ya existe ficha Formato A para esa semana y sede",
        );
      throw error;
    }
  }

  @Get("fichas/:fichaId")
  @RequiresPermissions(["records:read"])
  @ApiOkResponse({ description: "Ficha semanal de la institución autorizada" })
  async detail(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Param("fichaId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const actorId = request.authenticatedSession.account.accountId;
    return this.database.client.$transaction(async (tx) => {
      const row = await tx.mttsWeeklyReport.findFirst({
        where: {
          id,
          institutionId,
          institution: {
            active: true,
            professionalAssignments: {
              some: currentProfessionalScope(actorId, "records:read"),
            },
          },
        },
        select: {
          ...receiptFields,
          institutionId: true,
          site: true,
          weekStart: true,
          weekEnd: true,
          payload: true,
        },
      });
      if (!row) throw new NotFoundException();
      await tx.auditEvent.create({
        data: {
          actorId,
          action: "mtts.form_a.read",
          targetId: row.id,
          institutionId,
        },
      });
      return row;
    });
  }
}
