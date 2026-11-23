import { createHash } from "node:crypto";
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
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
import { readAfter } from "../ibite/query-cursor.js";
import { currentProfessionalScope } from "../ibite/professional-scope.js";

const workshopEvidence = {
  version: "jugar-para-cuidar/1",
  status: "ready",
  title: "Evaluación de la fidelidad de implementación",
  workshop: "Jugar para cuidar",
  fields: [
    {
      id: "workshopDate",
      label: "Fecha del taller",
      type: "date",
      required: true,
    },
    { id: "place", label: "Lugar", type: "shortText", required: true },
    {
      id: "attendance",
      label: "Número de asistentes",
      type: "shortText",
      required: true,
    },
    {
      id: "familyInstitutions",
      label: "Familias vinculadas al colegio",
      type: "institution",
      required: true,
    },
    {
      id: "facilitator",
      label: "Nombre del facilitador o facilitadora",
      type: "shortText",
      required: true,
    },
    {
      id: "changes",
      label: "Si hizo cambios al taller, explique cuáles y porqué",
      type: "longText",
      required: false,
    },
    {
      id: "materials",
      label: "Si falló o faltó algún material, indique cuál",
      type: "longText",
      required: false,
    },
    {
      id: "improvements",
      label: "¿Qué mejoraría para la próxima vez?",
      type: "longText",
      required: true,
    },
  ],
  grids: [
    {
      id: "workshopDelivery",
      label: "En la preparación y desarrollo",
      required: true,
      visibleOptionCount: 3,
      visibleOptions: ["Sí", "Parcial", "No"],
      visibleRowCount: 7,
      observedRows: [
        "Leí la guía completa y probé cada juego antes del taller",
        "Monté las estaciones de juego con todos sus materiales",
        "Realice cada actividad como estaba prevista en la guía del taller",
        "Fui claro o clara al explicar los conceptos y las reglas de los juegos",
        "Desarrolle las actividades en el tiempo previsto",
        "Procuré la participación de todas las personas",
        "Mantuve un clima respetuoso, sin juzgar las respuestas",
      ],
    },
    {
      id: "process",
      label: "Las personas que asistieron al taller",
      required: true,
      visibleRowCount: 3,
      visibleOptions: ["Muy bajo", "Bajo", "Aceptable", "Alto", "Muy alto"],
      observedRows: [
        "Participaron activamente en las actividades",
        "Mostraron comprender las tres dimensiones al explicarlas con sus palabras",
        "Mostraron interés en llevar los juegos a casa",
      ],
    },
  ],
  incompleteGrids: [],
  observedInstitutionLabels: [
    "IE Fe y Alegría La Paz",
    "IE Colegio de Cristo",
    "IE Escuela Normal Superior de Manizales",
    "IE La Asunción",
    "IE Liceo Mixto Sinaí",
    "IE Bosques del Norte",
    "IE La Sultana",
    "IE San Pío X",
    "IE Instituto Latinoamericano",
    "IE Instituto Técnico Francisco José de Caldas",
  ],
} as const;

const textFields = [
  "place",
  "attendance",
  "facilitator",
  "changes",
  "materials",
  "improvements",
] as const;
const inputFields = [
  "version",
  "workshopDate",
  "workshopDelivery",
  "process",
  ...textFields,
] as const;
const required = [
  "version",
  "workshopDate",
  "workshopDelivery",
  "process",
  "place",
  "attendance",
  "facilitator",
  "improvements",
];
const receipt = { id: true, formVersion: true, createdAt: true } as const;
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

function readWorkshopDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new BadRequestException("Fecha de taller inválida");
  const date = new Date(value);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new BadRequestException("Fecha de taller inválida");
  return date;
}

function parseCapture(input: unknown) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !inputFields.some((field) => field === key),
    )
  ) {
    throw new BadRequestException("Campos de Factibilidad inválidos");
  }
  const body = input as Record<string, unknown>;
  if (body.version !== workshopEvidence.version) {
    throw new BadRequestException("Versión o fecha de taller inválida");
  }
  const workshopDate = readWorkshopDate(body.workshopDate);
  const text: Record<string, string> = {};
  for (const field of textFields) {
    const value = body[field];
    if (!required.includes(field) && value === undefined) continue;
    if (
      typeof value !== "string" ||
      value.length > 2000 ||
      (required.includes(field) && !value.trim())
    ) {
      throw new BadRequestException("Campo de texto del taller inválido");
    }
    text[field] = value.trim();
  }
  const grids: Record<string, string[]> = {};
  for (const grid of workshopEvidence.grids) {
    const rows = body[grid.id];
    if (!Array.isArray(rows) || rows.length !== grid.observedRows.length) {
      throw new BadRequestException(
        "Cada fila de la cuadrícula requiere una respuesta",
      );
    }
    grids[grid.id] = Array.from(rows, (value: unknown) => {
      if (
        typeof value !== "string" ||
        !grid.visibleOptions.some((option) => option === value)
      ) {
        throw new BadRequestException("Opción de la cuadrícula inválida");
      }
      return value;
    });
  }
  return { workshopDate, payload: { ...text, ...grids } };
}

@ApiTags("Factibilidad de talleres")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@Controller("interno/instituciones/:institucionId/factibilidad")
export class WorkshopFeasibilityFormController {
  constructor(private readonly database: DatabaseService) {}

  @Get("formulario")
  @RequiresPermissions(["records:read"])
  @ApiOkResponse({
    description: "Formulario versionado del taller Jugar para cuidar",
  })
  @ApiResponse({
    status: 400,
    description: "Institución con identificador inválido",
  })
  @ApiResponse({ status: 401, description: "Sesión inválida" })
  @ApiResponse({ status: 403, description: "Permiso insuficiente" })
  @ApiResponse({
    status: 404,
    description: "Institución inexistente o fuera de ámbito",
  })
  async definition(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const actorId = request.authenticatedSession.account.accountId;
    const institution = await this.database.client.institution.findFirst({
      where: {
        id: institutionId,
        active: true,
        professionalAssignments: {
          some: currentProfessionalScope(actorId, "records:read"),
        },
      },
      select: { id: true },
    });
    if (!institution) throw new NotFoundException();
    return workshopEvidence;
  }

  @Post("evaluaciones")
  @RequiresPermissions(["records:create"])
  @ApiHeader({
    name: "Idempotency-Key",
    required: false,
    schema: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
  })
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: false,
      required,
      properties: {
        ...Object.fromEntries(
          textFields.map((field) => [
            field,
            { type: "string", maxLength: 2000 },
          ]),
        ),
        version: { type: "string", enum: [workshopEvidence.version] },
        workshopDate: { type: "string", format: "date" },
        ...Object.fromEntries(
          workshopEvidence.grids.map((grid) => [
            grid.id,
            {
              type: "array",
              minItems: grid.visibleRowCount,
              maxItems: grid.visibleRowCount,
              items: { type: "string", enum: [...grid.visibleOptions] },
            },
          ]),
        ),
      },
    },
  })
  @ApiCreatedResponse({
    description: "Acuse con id de evaluación, versión y fecha",
  })
  @ApiResponse({
    status: 400,
    description: "Institución, fecha, campos o respuestas inválidos",
  })
  @ApiResponse({ status: 401, description: "Sesión inválida" })
  @ApiResponse({ status: 403, description: "Permiso insuficiente" })
  @ApiResponse({
    status: 409,
    description: "Clave reutilizada con otro contenido",
  })
  @ApiResponse({
    status: 404,
    description: "Institución inexistente o fuera de ámbito",
  })
  async submit(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    const authorId = request.authenticatedSession.account.accountId;
    const { workshopDate, payload } = parseCapture(body);
    if (key !== undefined && !/^[A-Za-z0-9_-]{16,128}$/.test(key))
      throw new BadRequestException("Clave de reintento inválida");
    const idempotencyKeyDigest = key === undefined ? null : digest(key);
    const requestDigest =
      key === undefined
        ? null
        : digest(
            JSON.stringify([workshopEvidence.version, workshopDate, payload]),
          );
    return this.database.client.$transaction(async (tx) => {
      const scope = await tx.professionalInstitution.findFirst({
        where: {
          institutionId,
          institution: { active: true },
          ...currentProfessionalScope(authorId, "records:create"),
        },
        select: { institutionId: true },
      });
      if (!scope) throw new NotFoundException();
      const data = {
        institutionId,
        authorId,
        workshopDate,
        formVersion: workshopEvidence.version,
        payload,
        idempotencyKeyDigest,
        requestDigest,
      };
      const [evaluation] = idempotencyKeyDigest
        ? await tx.workshopEvaluation.createManyAndReturn({
            data,
            select: receipt,
            skipDuplicates: true,
          })
        : [await tx.workshopEvaluation.create({ data, select: receipt })];
      if (!evaluation) {
        const previous = await tx.workshopEvaluation.findFirstOrThrow({
          where: { institutionId, authorId, idempotencyKeyDigest },
          select: { ...receipt, requestDigest: true },
        });
        if (previous.requestDigest !== requestDigest)
          throw new ConflictException(
            "La clave ya está asociada a otro contenido",
          );
        return {
          id: previous.id,
          formVersion: previous.formVersion,
          createdAt: previous.createdAt,
        };
      }
      await tx.auditEvent.create({
        data: {
          actorId: authorId,
          action: "feasibility.workshop.submitted",
          targetId: evaluation.id,
          institutionId,
        },
      });
      return evaluation;
    });
  }

  @Get("evaluaciones")
  @RequiresPermissions(["records:read"])
  @ApiQuery({ name: "desde", schema: { type: "string", format: "date" } })
  @ApiQuery({ name: "hasta", schema: { type: "string", format: "date" } })
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiOkResponse({
    description: "Referencias de evaluaciones sin textos narrativos",
  })
  @ApiResponse({ status: 400, description: "Rango o cursor inválido" })
  @ApiResponse({
    status: 404,
    description: "Institución o cursor fuera de ámbito",
  })
  async list(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Req() request: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const { desde, hasta, ...cursor } = query;
    const after = readAfter(cursor);
    const first = readWorkshopDate(desde);
    const last = readWorkshopDate(hasta);
    if (last < first || last.getTime() - first.getTime() >= 366 * 86_400_000)
      throw new BadRequestException("Rango de talleres inválido");
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
      workshopDate: { gte: first, lte: last },
    };
    return this.database.client.$transaction(async (tx) => {
      if (
        !(await tx.institution.findFirst({
          where: { id: institutionId, ...institution },
          select: { id: true },
        }))
      )
        throw new NotFoundException();
      const anchor = after
        ? await tx.workshopEvaluation.findFirst({
            where: { ...filter, id: after },
            select: { id: true, workshopDate: true },
          })
        : null;
      if (after && !anchor) throw new NotFoundException();
      const rows = await tx.workshopEvaluation.findMany({
        where: {
          ...filter,
          ...(anchor
            ? {
                OR: [
                  { workshopDate: { lt: anchor.workshopDate } },
                  { workshopDate: anchor.workshopDate, id: { lt: anchor.id } },
                ],
              }
            : {}),
        },
        orderBy: [{ workshopDate: "desc" }, { id: "desc" }],
        take: 26,
        select: { ...receipt, workshopDate: true },
      });
      await tx.auditEvent.create({
        data: {
          actorId,
          action: "feasibility.workshop.list",
          targetId: institutionId,
          institutionId,
        },
      });
      return {
        items: rows.slice(0, 25),
        nextCursor: rows.length > 25 ? rows[24].id : null,
      };
    });
  }

  @Get("evaluaciones/:evaluacionId")
  @RequiresPermissions(["records:read"])
  @ApiOkResponse({ description: "Evaluación de la institución autorizada" })
  @ApiResponse({
    status: 404,
    description: "Evaluación inexistente o fuera de ámbito",
  })
  async detail(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Param("evaluacionId", ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const actorId = request.authenticatedSession.account.accountId;
    return this.database.client.$transaction(async (tx) => {
      const evaluation = await tx.workshopEvaluation.findFirst({
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
          ...receipt,
          institutionId: true,
          workshopDate: true,
          payload: true,
        },
      });
      if (!evaluation) throw new NotFoundException();
      await tx.auditEvent.create({
        data: {
          actorId,
          action: "feasibility.workshop.read",
          targetId: id,
          institutionId,
        },
      });
      return evaluation;
    });
  }
}
