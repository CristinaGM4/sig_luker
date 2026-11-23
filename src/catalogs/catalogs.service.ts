import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.module.js";

@Injectable()
export class CatalogsService {
  constructor(private readonly database: DatabaseService) {}

  async listInstitutions(limit: number, after?: string) {
    const institutions = await this.database.client.institution.findMany({
      where: after === undefined ? {} : { code: { gt: after } },
      orderBy: { code: "asc" },
      take: limit + 1,
      select: { id: true, code: true, name: true, active: true },
    });
    return page(institutions, limit);
  }

  async listPeriods(limit: number, after?: string) {
    const periods = await this.database.client.academicPeriod.findMany({
      where: after === undefined ? {} : { code: { gt: after } },
      orderBy: { code: "asc" },
      take: limit + 1,
      select: {
        id: true,
        code: true,
        label: true,
        startsOn: true,
        endsOn: true,
      },
    });
    return page(
      periods.map((period) => ({
        ...period,
        startsOn: period.startsOn.toISOString().slice(0, 10),
        endsOn: period.endsOn.toISOString().slice(0, 10),
      })),
      limit,
    );
  }
}

function page<T extends { code: string }>(rows: T[], limit: number) {
  const items = rows.slice(0, limit);
  return {
    items,
    nextCursor: rows.length > limit ? rows[limit - 1].code : null,
  };
}
