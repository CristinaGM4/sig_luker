import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { DatabaseService } from "../database/database.module.js";

@ApiTags("SIG público")
@Controller("publico/sig/instituciones")
export class PublicInstitutionsController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @ApiOkResponse({
    description:
      "21 sedes del GeoPackage aportado. Asociación por nombre para navegación, sin datos de contacto ni psicosociales.",
    schema: {
      type: "object",
      required: ["type", "features"],
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
                  type: { type: "string", enum: ["Point"] },
                  coordinates: {
                    type: "array",
                    items: { type: "number" },
                    minItems: 2,
                    maxItems: 2,
                  },
                },
              },
              properties: {
                type: "object",
                properties: {
                  institutionKey: { type: "string" },
                  label: { type: "string" },
                  dane: { type: "string" },
                  parentDane: { type: "string" },
                  principal: { type: "boolean" },
                  source: { type: "string" },
                  mappingBasis: { type: "string", enum: ["reference-name"] },
                  mappingNote: { type: "string", nullable: true },
                },
              },
            },
          },
        },
      },
    },
  })
  async list(@Query() query: Record<string, unknown>) {
    if (Object.keys(query).length)
      throw new BadRequestException(
        "Esta capa se consulta completa, sin filtros de servidor.",
      );
    const rows = await this.database.client.$queryRaw<
      {
        source_id: number;
        institution_key: string;
        label: string;
        dane: string;
        parent_dane: string;
        principal: boolean;
        mapping_note: string | null;
        geometry: { type: "Point"; coordinates: [number, number] };
      }[]
    >`
      SELECT source_id,institution_key,label,dane,parent_dane,principal,mapping_note,ST_AsGeoJSON(location,15,0)::jsonb AS geometry
      FROM public_institution_sites ORDER BY source_id LIMIT 100
    `;
    return {
      type: "FeatureCollection",
      features: rows.map((row) => ({
        type: "Feature",
        id: row.source_id,
        geometry: row.geometry,
        properties: {
          institutionKey: row.institution_key,
          label: row.label,
          dane: row.dane,
          parentDane: row.parent_dane,
          principal: row.principal,
          source: "instituciones.gpkg",
          mappingBasis: "reference-name",
          mappingNote: row.mapping_note,
        },
      })),
    };
  }
}
