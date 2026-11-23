import type { classifyIbite17Record } from "./ibite17-classification.js";
import type { calculateIbite17Dimensions } from "./ibite17-dimensions.js";

type Dimensions = ReturnType<typeof calculateIbite17Dimensions>;
type Classification = ReturnType<typeof classifyIbite17Record>;

export function selectIbite17Orientation(
  dimensions: Dimensions,
  classification: Classification,
  branch: "A" | "B",
) {
  if (classification.complete === null) return null;

  const safety = dimensions.safetySignal;
  const safetyReview = safety === "alerta" || safety === "no_aclarada";
  const school =
    dimensions.school.level === "elevado" ||
    dimensions.schoolDisengagement === true;
  const distress =
    dimensions.combined.level === "elevado" ||
    dimensions.functionalImpairment === true;
  const { materialRisk, profile } = classification;
  const preventive = profile === 1 || profile === 2;

  return {
    action: selectAction(safety, materialRisk, school || distress, profile),
    timeframe: selectTimeframe(safetyReview, materialRisk || school, distress),
    route: selectRoute(
      safetyReview,
      materialRisk,
      dimensions.schoolDisengagement === true,
      distress,
      preventive,
    ),
    signals: [
      safety === "alerta" && "seguridad",
      safety === "no_aclarada" && "seguridad_no_aclarada",
      dimensions.functionalImpairment && "deterioro_funcional",
      dimensions.schoolDisengagement && "escolar",
      materialRisk && "material",
      profile === 1 && "perfil_1",
      profile === 2 && "perfil_2",
      profile === 4 && "recursos_perfil_4",
      profile === 5 && "recursos_perfil_5",
    ].filter((signal) => typeof signal === "string"),
    recommendationKey: safetyReview
      ? "ALERTA-" + branch
      : profile === null
        ? "INCOMPLETO"
        : profile + "-" + branch,
  };
}

function selectAction(
  safety: Dimensions["safetySignal"],
  material: boolean,
  psychosocial: boolean,
  profile: Classification["profile"],
) {
  if (safety === "alerta") return "valoracion_seguridad";
  if (safety === "no_aclarada") return "contacto_valoracion_seguridad";
  if (material) return "ruta_humanitaria";
  if (psychosocial) return "acompanamiento_psicosocial";
  if (profile === 1 || profile === 2) return "promocion_prevencion";
  if (profile === 4) return "acompanamiento_individual_familiar";
  if (profile === 5) return "acompanamiento_recursos";
  return "valoracion_profesional";
}

function selectTimeframe(
  safety: boolean,
  materialOrSchool: boolean,
  distress: boolean,
) {
  if (safety) return "mismo_dia";
  if (materialOrSchool) return "48_72_horas_segun_ruta";
  if (distress) return "dentro_de_la_semana";
  return "seguimiento_segun_plan";
}

function selectRoute(
  safety: boolean,
  material: boolean,
  schoolFlag: boolean,
  distress: boolean,
  preventive: boolean,
) {
  if (safety) return "profesional_salud_mental";
  if (material) return "gestion_riesgo_humanitaria";
  if (schoolFlag) return "rectoria_orientacion_secretaria";
  if (distress) return "orientacion_escolar";
  if (preventive) return "orientacion_entornos_saludables";
  return "orientacion_profesional";
}
