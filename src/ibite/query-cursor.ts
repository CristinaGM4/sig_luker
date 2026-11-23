import { BadRequestException } from "@nestjs/common";

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function readAfter(query: Record<string, unknown>) {
  const { after } = query;
  if (
    Object.keys(query).some((key) => key !== "after") ||
    (after !== undefined && (typeof after !== "string" || !uuid.test(after)))
  ) {
    throw new BadRequestException("Cursor inválido");
  }
  return after;
}
