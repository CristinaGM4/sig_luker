import {
  BadRequestException,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { ReportedRepresentativeAuthorization } from "./representative-authorization.js";
import type { IbiteRefusalReason } from "../generated/prisma/client.js";

export const SYNTHETIC_IBITE_FORM = Symbol("SYNTHETIC_IBITE_FORM");
export const SYNTHETIC_CAPTURE_KEY = Symbol("SYNTHETIC_CAPTURE_KEY");

export interface SyntheticIbiteForm {
  instrumentCode: "IBITE-17";
  variant: "ADOLESCENT" | "CAREGIVER";
  sourceVersion: string;
  formVersion: string;
  questions: ReadonlyArray<{
    id: string;
    text: string;
    options: ReadonlyArray<{ id: string; text: string; sourceValue: string }>;
  }>;
}

function exactFields(
  value: unknown,
  fields: readonly string[],
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === fields.length &&
    fields.every((field) => Object.hasOwn(value, field))
  );
}

export function readSyntheticRefusal(body: unknown, form: SyntheticIbiteForm) {
  if (
    (!exactFields(body, ["formVersion"]) &&
      !exactFields(body, ["formVersion", "reason"])) ||
    typeof body.formVersion !== "string"
  ) {
    throw new BadRequestException("Carga de negativa inválida");
  }
  const reason = Object.hasOwn(body, "reason") ? body.reason : "PARTICIPATION";
  if (reason !== "PARTICIPATION" && reason !== "REPRESENTATIVE_AUTHORIZATION") {
    throw new BadRequestException("Motivo de negativa inválido");
  }
  if (
    reason === "REPRESENTATIVE_AUTHORIZATION" &&
    form.variant !== "ADOLESCENT"
  ) {
    throw new UnprocessableEntityException(
      "Motivo no aplicable a este formulario",
    );
  }
  return {
    formVersion: body.formVersion,
    reason: reason as IbiteRefusalReason,
  };
}

export function readSyntheticSubmission(
  body: unknown,
  form: SyntheticIbiteForm,
) {
  const fields = ["formVersion", "participation", "answers"];
  const needsDeclaration = form.variant === "ADOLESCENT";
  if (needsDeclaration) fields.push("reportedRepresentativeAuthorization");
  if (
    !exactFields(body, fields) ||
    typeof body.formVersion !== "string" ||
    !Array.isArray(body.answers)
  ) {
    throw new BadRequestException("Carga de captura inválida");
  }
  if (body.participation !== "accepted") {
    throw new UnprocessableEntityException(
      "Se requiere aceptación de participación para finalizar",
    );
  }
  const authorization = body.reportedRepresentativeAuthorization;
  if (
    needsDeclaration &&
    authorization !== "authorized" &&
    authorization !== "unknown"
  ) {
    throw new UnprocessableEntityException(
      "Declaración de autorización inválida",
    );
  }
  if (body.answers.length !== form.questions.length) {
    throw new UnprocessableEntityException("Número de respuestas inválido");
  }
  const byQuestion = new Map<string, string>();
  for (const answer of body.answers as unknown[]) {
    if (
      !exactFields(answer, ["questionId", "optionId"]) ||
      typeof answer.questionId !== "string" ||
      typeof answer.optionId !== "string" ||
      byQuestion.has(answer.questionId)
    ) {
      throw new UnprocessableEntityException("Respuesta inválida o duplicada");
    }
    byQuestion.set(answer.questionId, answer.optionId);
  }
  const answers = form.questions.map(({ id, options }) => {
    const option = options.find(
      ({ id: optionId }) => byQuestion.get(id) === optionId,
    );
    if (!option)
      throw new UnprocessableEntityException("Pregunta u opción inválida");
    return option.sourceValue;
  });
  return {
    formVersion: body.formVersion,
    answers,
    context: {},
    reportedRepresentativeAuthorization: authorization as
      ReportedRepresentativeAuthorization | undefined,
  };
}
