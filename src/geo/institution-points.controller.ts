import {
  BadRequestException,
  Controller,
  Get,
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
import {
  RequiresPermissions,
  SessionGuard,
  type AuthenticatedRequest,
} from "../auth/session.guard.js";
import { DatabaseService } from "../database/database.module.js";
import { readAfter } from "../ibite/query-cursor.js";
import { currentProfessionalScope } from "../ibite/professional-scope.js";

export function readBox(input: unknown) {
  if (typeof input !== "string" || input.length > 120)
    throw new BadRequestException("Se requiere bbox");
  const parts = input.split(",");
  if (
    parts.length !== 4 ||
    parts.some((part) => !/^-?\d+(?:\.\d+)?$/.test(part.trim()))
  )
    throw new BadRequestException("bbox inválida");
  const [west, south, east, north] = parts.map(Number);
  if (
    west < -180 ||
    east > 180 ||
    south < -90 ||
    north > 90 ||
    west >= east ||
    south >= north
  )
    throw new BadRequestException("bbox fuera de WGS84 o sin extensión");
  return { west, south, east, north };
}

interface PointRow {
  id: string;
  label: string;
  source: string;
  geometry: { type: "Point"; coordinates: [number, number] };
}

const pageSize = 100;

@ApiTags("SIG institucional")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@RequiresPermissions(["records:read"])
@Controller("interno/instituciones/:institucionId/sig")
export class InstitutionPointsController {
  constructor(private readonly database: DatabaseService) {}

  @Get("puntos")
  @ApiQuery({
    name: "bbox",
    schema: { type: "string", example: "-76,5,-75,6" },
  })
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "string", format: "uuid" },
  })
  @ApiOkResponse({
    description: "GeoJSON FeatureCollection de puntos institucionales en WGS84",
  })
  @ApiResponse({
    status: 400,
    description: "UUID, caja espacial o cursor inválidos",
  })
  @ApiResponse({ status: 401, description: "Sesión inválida" })
  @ApiResponse({ status: 403, description: "Permiso insuficiente" })
  @ApiResponse({
    status: 404,
    description: "Institución o cursor fuera de ámbito",
  })
  async list(
    @Param("institucionId", ParseUUIDPipe) institutionId: string,
    @Query() query: Record<string, unknown>,
    @Req() request: AuthenticatedRequest,
  ) {
    const { bbox, ...cursor } = query;
    const { west, south, east, north } = readBox(bbox);
    const after = readAfter(cursor) ?? null;
    const actorId = request.authenticatedSession.account.accountId;
    return this.database.client.$transaction(async (tx) => {
      const scope = await tx.professionalInstitution.findFirst({
        where: {
          institutionId,
          institution: { active: true },
          ...currentProfessionalScope(actorId, "records:read"),
        },
        select: { institutionId: true },
      });
      if (!scope) throw new NotFoundException();
      if (after) {
        const [anchor] = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM institution_map_points
          WHERE id = ${after}::uuid AND institution_id = ${institutionId}::uuid
            AND ST_Intersects(location, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))
        `;
        if (!anchor) throw new NotFoundException();
      }
      const rows = await tx.$queryRaw<PointRow[]>`
        SELECT id, label, source, ST_AsGeoJSON(location, 9)::jsonb AS geometry
        FROM institution_map_points
        WHERE institution_id = ${institutionId}::uuid
          AND (${after}::uuid IS NULL OR id > ${after}::uuid)
          AND ST_Intersects(location, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))
        ORDER BY id
        LIMIT ${pageSize + 1}
      `;
      await tx.auditEvent.create({
        data: {
          actorId,
          action: "sig.institution.points.read",
          targetId: institutionId,
          institutionId,
        },
      });
      return {
        type: "FeatureCollection",
        features: rows
          .slice(0, pageSize)
          .map(({ id, label, source, geometry }) => ({
            type: "Feature",
            id,
            geometry,
            properties: { label, source },
          })),
        nextCursor: rows.length > pageSize ? rows[pageSize - 1].id : null,
      };
    });
  }
}
