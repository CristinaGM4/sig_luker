import type { classifyIbiteDa28Record } from "./ibite-da28-classification.js";
import type { calculateIbiteDa28Dimensions } from "./ibite-da28-dimensions.js";

type Dimensions = ReturnType<typeof calculateIbiteDa28Dimensions>;
type Classification = ReturnType<typeof classifyIbiteDa28Record>;

// BT:BV map the same ordered conditions, with profile-specific action only in BT.
const orientationByPriority = {
  seguridad: ["valoracion_seguridad", "mismo_dia", "profesional_salud_mental"],
  malestar: [
    "acompanamiento_psicosocial",
    "dentro_de_la_semana",
    "bienestar_docente_talento_humano",
  ],
  reintegracion: [
    "reincorporacion_gradual",
    "48_72_horas",
    "coordinacion_rectoria_talento_humano",
  ],
  apoyos: ["fortalecer_apoyos", "mediano_plazo", "bienestar_docente_pares"],
  infraestructura: [
    "gestion_infraestructura_protocolos",
    "planeacion_institucional",
    "gestion_riesgo_infraestructura",
  ],
  habitual: [
    "valoracion_profesional",
    "seguimiento_habitual",
    "bienestar_docente_institucional",
  ],
} as const;

export function selectIbiteDa28Orientation(
  dimensions: Dimensions,
  classification: Classification,
) {
  if (classification.complete === null) return null;

  const safety = dimensions.safetySignal === "alerta";
  const priority = selectPriority(dimensions, safety);
  const [defaultAction, timeframe, route] = orientationByPriority[priority];
  const preventive =
    priority === "habitual" &&
    (classification.profile === 1 || classification.profile === 2);
  const signals = [
    safety && "seguridad",
    dimensions.functionalImpairment && "deterioro_funcional",
    dimensions.workReintegrationRisk && "reintegracion",
    dimensions.insufficientCoping && "afrontamiento",
    dimensions.communityDisruption && "comunidad",
    dimensions.structuralRisk && "institucional",
    dimensions.mediaOverexposure && "comunicacion",
  ].filter((signal) => typeof signal === "string");

  return {
    action: preventive ? "promocion_prevencion" : defaultAction,
    timeframe,
    route,
    signals,
    recommendationKey: safety
      ? "ALERTA"
      : classification.profile === null
        ? "INCOMPLETO"
        : String(classification.profile),
  };
}

function selectPriority(dimensions: Dimensions, safety: boolean) {
  if (safety) return "seguridad";
  if (
    dimensions.combined.level === "elevado" ||
    dimensions.functionalImpairment
  )
    return "malestar";
  if (
    dimensions.workReintegration.level === "bajo" ||
    dimensions.workReintegrationRisk
  )
    return "reintegracion";
  if (dimensions.copingAtRisk || dimensions.communityAtRisk) return "apoyos";
  if (dimensions.structuralRisk) return "infraestructura";
  return "habitual";
}
