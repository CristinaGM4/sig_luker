import { BadRequestException } from "@nestjs/common";

export const mttsFormA = {
  version: "mtts-formato-a/1",
  roles: [
    "Psicología",
    "Psicosocial/familia",
    "Liderazgo clínico",
    "Coordinación",
    "Datos/tablero",
    "Gestión del riesgo",
    "Otro",
  ],
  activities: [
    "Revisión de alertas/tablero",
    "Valoración individual",
    "Contacto familiar",
    "Intervención breve",
    "Grupo de apoyo",
    "Encuentro universal",
    "Remisión y seguimiento",
    "Georreferenciación",
    "Plan escolar de riesgo",
    "Otra",
  ],
  countFields: [
    "valoraciones",
    "contactosFamiliares",
    "remisiones",
    "enlacesConfirmados",
    "sesionesGrupales",
    "encuentrosUniversales",
  ],
  dimensions: [
    "aceptabilidad",
    "adecuacion",
    "factibilidad",
    "fidelidad",
    "adopcion",
    "coordinacion",
    "seguridad",
    "calidadRegistro",
  ],
  dimensionQuestions: {
    aceptabilidad:
      "Las actividades fueron bien recibidas por estudiantes, familias y escuela.",
    adecuacion:
      "La respuesta se ajustó a las necesidades y al contexto de esta sede.",
    factibilidad:
      "Fue posible ejecutar lo previsto con tiempo, personal y recursos disponibles.",
    fidelidad:
      "Se siguieron los pasos esenciales del protocolo de priorización y respuesta.",
    adopcion:
      "El personal escolar utilizó o apoyó activamente las rutas y herramientas.",
    coordinacion:
      "La coordinación entre escuela, Universidad, Fundación Luker y servicios fue operativa.",
    seguridad:
      "Las alertas se tramitaron según los procedimientos de seguridad y confidencialidad.",
    calidadRegistro:
      "Las actividades y el estado de las rutas quedaron documentados oportunamente.",
  },
  scale: [
    { value: 1, label: "Nunca / nada" },
    { value: 2, label: "Rara vez / poco" },
    { value: 3, label: "A veces / parcialmente" },
    { value: 4, label: "Casi siempre / bastante" },
    { value: 5, label: "Siempre / completamente" },
    { value: "NA", label: "No aplica" },
  ],
  barriers: [
    "Tiempo/calendario escolar",
    "Carga de casos",
    "Personal insuficiente",
    "Dificultad para contactar familias",
    "Ausentismo o movilidad estudiantil",
    "Conectividad/tablero",
    "Datos incompletos",
    "Dificultades de coordinación escolar",
    "Capacidad de salud/protección",
    "Estigma/desconfianza",
    "Transporte/acceso",
    "Confidencialidad/acuerdos",
    "Ninguna",
    "Otra",
  ],
  facilitators: [
    "Compromiso de directivos",
    "Orientación escolar activa",
    "Apoyo de Fundación Luker/plataforma",
    "Coordinación Universidad–escuela",
    "Participación familiar",
    "Protocolos claros",
    "Disponibilidad de red de salud/protección",
    "Trabajo interdisciplinario",
    "Materiales adecuados",
    "Otro",
  ],
  statuses: [
    "En curso según lo previsto",
    "Con retrasos recuperables",
    "Con dificultades que requieren decisión directiva",
  ],
  maximumSelections: 3,
  instructions: "No incluir nombres ni datos identificables de estudiantes.",
} as const;

function record(value: unknown, fields: readonly string[]) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !fields.includes(key))
  ) {
    throw new BadRequestException("Campos MTTS inválidos");
  }
  return value as Record<string, unknown>;
}

function label(value: unknown, allowed: readonly string[]) {
  if (typeof value !== "string" || !allowed.includes(value))
    throw new BadRequestException("Opción MTTS inválida");
  return value;
}

function selections(value: unknown, allowed: readonly string[], max: number) {
  if (
    !Array.isArray(value) ||
    value.length > max ||
    new Set(value).size !== value.length
  )
    throw new BadRequestException("Selección MTTS inválida");
  return value.map((entry: unknown) => label(entry, allowed));
}

export function readMttsDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new BadRequestException("Fecha MTTS inválida");
  const result = new Date(value);
  if (
    !Number.isFinite(result.getTime()) ||
    result.toISOString().slice(0, 10) !== value
  )
    throw new BadRequestException("Fecha MTTS inválida");
  return result;
}

export function normalizeMttsSite(value: unknown) {
  const site = optionalText(value, 160)?.normalize("NFC").replace(/\s+/g, " ");
  if (!site) throw new BadRequestException("Sede MTTS inválida");
  return site;
}

function optionalText(value: unknown, max = 1000) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > max)
    throw new BadRequestException("Texto MTTS inválido");
  return value.trim();
}

export function parseMttsFormA(input: unknown) {
  const narrativeFields = [
    "roleDetail",
    "activityDetail",
    "barrierDetail",
    "mainBarrier",
    "facilitatorDetail",
    "mainFacilitator",
    "adjustmentDetail",
    "escalationTopic",
  ] as const;
  const body = record(input, [
    "version",
    "site",
    "weekStart",
    "weekEnd",
    "role",
    "activities",
    "counts",
    "countsUnavailable",
    "ratings",
    "barriers",
    "facilitators",
    "adjustment",
    "status",
    "escalation",
    ...narrativeFields,
  ]);
  if (body.version !== mttsFormA.version)
    throw new BadRequestException("Versión MTTS inválida");
  const site = normalizeMttsSite(body.site);
  const weekStart = readMttsDate(body.weekStart);
  const weekEnd = readMttsDate(body.weekEnd);
  if (
    !site ||
    weekEnd < weekStart ||
    weekEnd.getTime() - weekStart.getTime() > 6 * 86_400_000
  )
    throw new BadRequestException("Sede o intervalo semanal inválido");
  const ratings = record(body.ratings, mttsFormA.dimensions);
  const validatedRatings: Record<string, number | "NA"> = {};
  for (const [dimension, value] of Object.entries(ratings)) {
    if (value !== "NA" && ![1, 2, 3, 4, 5].includes(value as number))
      throw new BadRequestException("Valoración MTTS inválida");
    validatedRatings[dimension] = value as number | "NA";
  }
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(
    record(body.counts ?? {}, mttsFormA.countFields),
  )) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
      throw new BadRequestException("Conteo MTTS inválido");
    counts[key] = value;
  }
  const countsUnavailable = body.countsUnavailable;
  const escalation = body.escalation;
  if (
    typeof countsUnavailable !== "boolean" ||
    typeof escalation !== "boolean" ||
    (countsUnavailable && Object.keys(counts).length > 0)
  )
    throw new BadRequestException(
      "Disponibilidad, conteos o escalamiento inválidos",
    );
  return {
    version: mttsFormA.version,
    site,
    weekStart,
    weekEnd,
    payload: {
      role: label(body.role, mttsFormA.roles),
      activities: selections(
        body.activities,
        mttsFormA.activities,
        mttsFormA.activities.length,
      ),
      counts,
      countsUnavailable,
      ratings: validatedRatings,
      barriers: selections(
        body.barriers,
        mttsFormA.barriers,
        mttsFormA.maximumSelections,
      ),
      facilitators: selections(
        body.facilitators,
        mttsFormA.facilitators,
        mttsFormA.maximumSelections,
      ),
      adjustment: label(body.adjustment, ["Sí", "No", "No sé"]),
      status: label(body.status, mttsFormA.statuses),
      escalation,
      ...Object.fromEntries(
        narrativeFields.flatMap((field) => {
          const value = optionalText(body[field]);
          return value === undefined ? [] : [[field, value]];
        }),
      ),
    },
  };
}
