import { BadRequestException } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client.js";
import { mttsFormA, normalizeMttsSite, readMttsDate } from "./form-a.js";

export function readMttsRange(
  query: Record<string, unknown>,
  paginated: boolean,
) {
  const { desde, hasta, after, sede, porSemana } = query;
  const keys = ["desde", "hasta", "sede", paginated ? "after" : "porSemana"];
  if (
    Object.keys(query).some((key) => !keys.includes(key)) ||
    (after !== undefined &&
      (typeof after !== "string" ||
        !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(after))) ||
    (porSemana !== undefined && porSemana !== "true" && porSemana !== "false")
  ) {
    throw new BadRequestException("Filtros MTTS inválidos");
  }
  const first = readMttsDate(desde);
  const last = readMttsDate(hasta);
  if (last < first || last.getTime() - first.getTime() >= 366 * 86_400_000)
    throw new BadRequestException("Rango MTTS inválido");
  return {
    first,
    last,
    after,
    siteKey:
      sede === undefined ? undefined : normalizeMttsSite(sede).toLowerCase(),
    weekly: porSemana === "true",
  };
}

export function summarizeMttsWeeks(
  rows: readonly { weekStart: Date; payload: Prisma.JsonValue }[],
) {
  const groups = new Map<string, Prisma.JsonValue[]>();
  for (const { weekStart, payload } of rows) {
    const day = weekStart.toISOString().slice(0, 10);
    const group = groups.get(day);
    if (group) group.push(payload);
    else groups.set(day, [payload]);
  }
  return [...groups.keys()].sort().map((weekStart) => ({
    weekStart,
    ...summarizeMttsFormA(groups.get(weekStart)!),
  }));
}

function readObject(value: Prisma.JsonValue | undefined): Prisma.JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function summarizeMttsFormA(payloads: readonly Prisma.JsonValue[]) {
  const total = payloads.length;
  const records = payloads.map(readObject);
  const dimensions = Object.fromEntries(
    mttsFormA.dimensions.map((dimension) => {
      const distribution = [0, 0, 0, 0, 0];
      const numeric: number[] = [];
      let notApplicable = 0;
      for (const payload of records) {
        const rating = readObject(payload.ratings)[dimension];
        if (rating === "NA") notApplicable++;
        else if (
          typeof rating === "number" &&
          Number.isInteger(rating) &&
          rating >= 1 &&
          rating <= 5
        ) {
          distribution[rating - 1]++;
          numeric.push(rating);
        }
      }
      numeric.sort((a, b) => a - b);
      const middle = Math.floor(numeric.length / 2);
      const median =
        numeric.length === 0
          ? null
          : (numeric[middle] + numeric[Math.floor((numeric.length - 1) / 2)]) /
            2;
      return [
        dimension,
        {
          distribution,
          median,
          rated: numeric.length,
          notApplicable,
          missing: total - numeric.length - notApplicable,
          notApplicablePercent: total ? (100 * notApplicable) / total : null,
        },
      ];
    }),
  );
  const frequencies = (
    field: "barriers" | "facilitators",
    options: readonly string[],
  ) =>
    options.map((option) => ({
      option,
      count: records.filter((payload) => {
        const selected = payload[field];
        return Array.isArray(selected) && selected.includes(option);
      }).length,
    }));
  return {
    total,
    dimensions,
    barriers: frequencies("barriers", mttsFormA.barriers),
    facilitators: frequencies("facilitators", mttsFormA.facilitators),
  };
}
