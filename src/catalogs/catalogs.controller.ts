import {
  BadRequestException,
  Controller,
  Get,
  Header,
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
import { CatalogsService } from "./catalogs.service.js";

const responseSchema = {
  type: "object",
  required: ["items", "nextCursor"],
  properties: {
    nextCursor: { type: "string", nullable: true },
  },
};

@ApiTags("Catálogos internos")
@ApiBearerAuth()
@ApiResponse({ status: 400, description: "Paginación inválida" })
@ApiResponse({ status: 401, description: "Sesión inválida o ausente" })
@ApiResponse({ status: 403, description: "Permiso insuficiente" })
@UseGuards(SessionGuard)
@RequiresPermissions(["records:read"])
@Controller("interno/catalogos")
export class CatalogsController {
  constructor(private readonly catalogs: CatalogsService) {}

  @Get("instituciones")
  @Header("Cache-Control", "no-store")
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "after", required: false, type: String })
  @ApiOkResponse({
    schema: {
      ...responseSchema,
      properties: {
        ...responseSchema.properties,
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "code", "name", "active"],
            properties: {
              id: { type: "string", format: "uuid" },
              code: { type: "string" },
              name: { type: "string" },
              active: { type: "boolean" },
            },
          },
        },
      },
    },
  })
  async listInstitutions(@Query() query: Record<string, unknown>) {
    const { limit, after } = parsePage(query);
    return this.catalogs.listInstitutions(limit, after);
  }

  @Get("periodos")
  @Header("Cache-Control", "no-store")
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "after", required: false, type: String })
  @ApiOkResponse({
    schema: {
      ...responseSchema,
      properties: {
        ...responseSchema.properties,
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "code", "label", "startsOn", "endsOn"],
            properties: {
              id: { type: "string", format: "uuid" },
              code: { type: "string" },
              label: { type: "string" },
              startsOn: { type: "string", format: "date" },
              endsOn: { type: "string", format: "date" },
            },
          },
        },
      },
    },
  })
  async listPeriods(@Query() query: Record<string, unknown>) {
    const { limit, after } = parsePage(query);
    return this.catalogs.listPeriods(limit, after);
  }
}

function parsePage(query: Record<string, unknown>) {
  const { limit = "25", after } = query;
  if (
    Object.keys(query).some((key) => key !== "limit" && key !== "after") ||
    typeof limit !== "string" ||
    !/^(?:[1-9][0-9]?|100)$/.test(limit) ||
    (after !== undefined &&
      (typeof after !== "string" || after.length === 0 || after.length > 256))
  ) {
    throw new BadRequestException("Parámetros de paginación inválidos");
  }
  return { limit: Number(limit), after };
}
