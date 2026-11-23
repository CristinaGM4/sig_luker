import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
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
import type { Prisma } from "../generated/prisma/client.js";
import { availableIbiteAssignments } from "./available-assignments.js";
import { readAfter } from "./query-cursor.js";

const pageSize = 25;
const assignmentProperties = {
  id: { type: "string", format: "uuid" },
  campaignId: { type: "string", format: "uuid" },
  institutionCode: { type: "string" },
  periodCode: { type: "string" },
  instrumentCode: { type: "string" },
  variant: { type: "string" },
  sourceVersion: { type: "string" },
  opensAt: { type: "string", format: "date-time" },
  closesAt: { type: "string", format: "date-time" },
  submitted: { type: "boolean" },
};
const assignmentSchema = {
  type: "object",
  required: Object.keys(assignmentProperties),
  properties: assignmentProperties,
};

function assignmentSelect(accountId: string) {
  return {
    id: true,
    campaignId: true,
    applications: {
      where: { respondentId: accountId },
      take: 1,
      select: { id: true },
    },
    campaign: {
      select: {
        institution: { select: { code: true } },
        period: { select: { code: true } },
        instrumentCode: true,
        variant: true,
        sourceVersion: true,
        opensAt: true,
        closesAt: true,
      },
    },
  } satisfies Prisma.IbiteAssignmentSelect;
}

type AssignmentRow = Prisma.IbiteAssignmentGetPayload<{
  select: ReturnType<typeof assignmentSelect>;
}>;

function toAssignment({
  id,
  campaignId,
  campaign,
  applications,
}: AssignmentRow) {
  const { institution, period, ...versionAndWindow } = campaign;
  return {
    id,
    campaignId,
    institutionCode: institution.code,
    periodCode: period.code,
    ...versionAndWindow,
    submitted: applications.length > 0,
  };
}

@ApiTags("Mis aplicaciones IBITE")
@ApiBearerAuth()
@ApiResponse({ status: 400, description: "Identificador o parámetro inválido" })
@ApiResponse({ status: 401, description: "Sesión inválida o ausente" })
@ApiResponse({ status: 403, description: "Permiso insuficiente" })
@UseGuards(SessionGuard)
@RequiresPermissions(["ibite:complete"])
@Controller("mis-aplicaciones-ibite")
export class MyIbiteAssignmentsController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["items", "nextCursor"],
      properties: {
        items: { type: "array", items: assignmentSchema },
        nextCursor: { type: "string", format: "uuid", nullable: true },
      },
    },
  })
  async list(
    @Req() request: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const after = readAfter(query);
    const { accountId } = request.authenticatedSession.account;
    const assignments = await this.database.client.ibiteAssignment.findMany({
      where: {
        ...availableIbiteAssignments(accountId, new Date()),
        ...(after ? { id: { gt: after } } : {}),
      },
      orderBy: { id: "asc" },
      take: pageSize + 1,
      select: assignmentSelect(accountId),
    });
    return {
      items: assignments.slice(0, pageSize).map(toAssignment),
      nextCursor:
        assignments.length > pageSize ? assignments[pageSize - 1].id : null,
    };
  }

  @Get(":habilitacionId")
  @ApiOkResponse({ schema: assignmentSchema })
  @ApiResponse({ status: 404, description: "Habilitación no disponible" })
  async detail(
    @Param("habilitacionId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { accountId } = request.authenticatedSession.account;
    const assignment = await this.database.client.ibiteAssignment.findFirst({
      where: { id, ...availableIbiteAssignments(accountId, new Date()) },
      select: assignmentSelect(accountId),
    });
    if (!assignment) throw new NotFoundException();
    return toAssignment(assignment);
  }

  @Get(":habilitacionId/acuse")
  @ApiResponse({ status: 404, description: "Acuse no disponible" })
  @ApiOkResponse({
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
  async receipt(
    @Param("habilitacionId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { accountId } = request.authenticatedSession.account;
    const application = await this.database.client.ibiteApplication.findFirst({
      where: {
        assignmentId: id,
        respondentId: accountId,
        assignment: availableIbiteAssignments(accountId, new Date()),
      },
      select: { id: true, sourceVersion: true, appliedAt: true },
    });
    if (!application) throw new NotFoundException();
    return {
      applicationId: application.id,
      assignmentId: id,
      sourceVersion: application.sourceVersion,
      submittedAt: application.appliedAt,
    };
  }
}
