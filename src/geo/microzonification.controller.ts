import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Header,
} from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DatabaseService } from "../database/database.module.js";
import { readBox } from "./institution-points.controller.js";
import {
  microzonificationLegend,
  microzonificationYear,
  type Zone,
} from "./microzonification.js";

const pageSize = 20;

@ApiTags("SIG público")
@Controller("publico/sig/microzonificacion")
export class MicrozonificationController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @Header("Content-Type", "application/geo+json")
  @ApiQuery({
    name: "bbox",
    schema: { type: "string", example: "-76,5,-75,6" },
  })
  @ApiQuery({
    name: "after",
    required: false,
    schema: { type: "integer", minimum: 1 },
  })
  @ApiOkResponse({
    description:
      "GeoJSON de microzonificación histórica en WGS84, hasta 20 polígonos por página",
    content: {
      "application/geo+json": {
        schema: {
          type: "object",
          required: ["type", "features", "nextCursor"],
          properties: {
            type: { type: "string", enum: ["FeatureCollection"] },
            features: {
              type: "array",
              items: {
                type: "object",
                required: ["type", "id", "geometry", "properties"],
                properties: {
                  type: { type: "string", enum: ["Feature"] },
                  id: { type: "integer" },
                  geometry: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["MultiPolygon"] },
                      coordinates: { type: "array", items: { type: "array" } },
                    },
                  },
                  properties: {
                    type: "object",
                    properties: {
                      zone: { type: "string", enum: ["A", "B", "P", "T"] },
                      label: { type: "string" },
                      mapYear: { type: "integer", enum: [2002] },
                    },
                  },
                },
              },
            },
            nextCursor: { type: "integer", nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Caja espacial, cursor o parámetros inválidos",
  })
  async list(@Query() query: Record<string, unknown>) {
    const { bbox, after, ...unknown } = query;
    const { west, south, east, north } = readBox(bbox);
    if (
      Object.keys(unknown).length ||
      (after !== undefined &&
        (typeof after !== "string" ||
          !/^[1-9]\d{0,9}$/.test(after) ||
          Number(after) > 2147483647))
    )
      throw new BadRequestException(
        "Parámetros de microzonificación inválidos",
      );

    const rows = await this.database.client.$queryRaw<
      { id: number; zone: Zone; geometry: unknown }[]
    >`
      SELECT id, zone, ST_AsGeoJSON(geometry, 15, 0)::jsonb AS geometry
      FROM microzonification_zones
      WHERE id > ${Number(after ?? 0)}::integer
        AND ST_Intersects(geometry, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))
      ORDER BY id LIMIT ${pageSize + 1}
    `;
    return {
      type: "FeatureCollection",
      features: rows.slice(0, pageSize).map(({ id, zone, geometry }) => ({
        type: "Feature",
        id,
        geometry,
        properties: {
          zone,
          label: microzonificationLegend[zone],
          mapYear: microzonificationYear,
        },
      })),
      nextCursor: rows.length > pageSize ? rows[pageSize - 1].id : null,
    };
  }
}

@ApiTags("SIG público")
@Controller("publico/sig/capas")
export class PublicGeoLayersController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @ApiOkResponse({
    description: "Capas cartográficas públicas cargadas",
    schema: {
      type: "object",
      required: ["layers"],
      properties: {
        layers: {
          type: "array",
          items: {
            type: "object",
            required: [
              "id",
              "title",
              "year",
              "historical",
              "crs",
              "geometryType",
              "source",
              "featuresPath",
              "legend",
            ],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              year: { type: "integer" },
              historical: { type: "boolean" },
              crs: { type: "string" },
              geometryType: { type: "string" },
              source: { type: "string" },
              featuresPath: { type: "string" },
              legend: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          },
        },
      },
    },
  })
  async list() {
    const [layer] = await this.database.client.$queryRaw<{ loaded: boolean }[]>`
      SELECT EXISTS(SELECT 1 FROM microzonification_zones) AS loaded
    `;
    return {
      layers: layer.loaded
        ? [
            {
              id: "microzonificacion-2002",
              title: "Microzonificación sísmica de Manizales",
              year: microzonificationYear,
              historical: true,
              crs: "EPSG:4326",
              geometryType: "MultiPolygon",
              source: "MapasCompilados.zip",
              featuresPath: "/api/v1/publico/sig/microzonificacion",
              legend: microzonificationLegend,
            },
          ]
        : [],
    };
  }
}
