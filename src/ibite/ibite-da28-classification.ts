import { calculateIbiteDa28Dimensions } from "./ibite-da28-dimensions.js";
import { riskByProfile, type IbiteProfile } from "./profile-risk.js";

type Dimensions = ReturnType<typeof calculateIbiteDa28Dimensions>;

export function classifyIbiteDa28Record(
  dimensions: Dimensions,
  sourceRecordPresent: boolean,
) {
  if (!sourceRecordPresent) {
    return { complete: null, profile: null, primaryRisk: null, risk: null };
  }
  if (!dimensions.coreComplete) {
    return {
      complete: false,
      profile: null,
      primaryRisk: "sin_datos_suficientes",
      risk: "sin_datos_suficientes",
    } as const;
  }

  const profile = selectProfile(dimensions);
  return {
    complete: true,
    profile,
    primaryRisk: selectPrimaryRisk(dimensions),
    risk:
      dimensions.safetySignal === "alerta"
        ? "critico_seguridad"
        : riskByProfile[profile],
  } as const;
}

function selectProfile(dimensions: Dimensions): IbiteProfile {
  const { combined, workReintegration, copingAtRisk, communityAtRisk } =
    dimensions;
  if (
    hasEmotionalRisk(dimensions) ||
    hasWorkRisk(dimensions) ||
    dimensions.safetySignal === "alerta"
  ) {
    return 3;
  }
  if (
    combined.level === "bajo" &&
    workReintegration.level === "alto" &&
    copingAtRisk === false &&
    communityAtRisk === false
  ) {
    return 1;
  }
  if (combined.level === "bajo" || combined.level === "intermedio") {
    if (copingAtRisk === true && communityAtRisk === true) return 4;
    if (
      (copingAtRisk === true && communityAtRisk === false) ||
      (copingAtRisk === false && communityAtRisk === true)
    ) {
      return 5;
    }
  }
  return 2;
}

function selectPrimaryRisk(dimensions: Dimensions) {
  if (dimensions.safetySignal === "alerta") return "vida_y_seguridad";
  if (hasEmotionalRisk(dimensions)) return "malestar_y_deterioro";
  if (hasWorkRisk(dimensions)) return "reintegracion_laboral";
  if (dimensions.copingAtRisk || dimensions.communityAtRisk) {
    return "recursos_o_comunidad";
  }
  if (dimensions.structuralRisk) return "estructural_institucional";
  return "sin_riesgo_prioritario";
}

function hasEmotionalRisk(dimensions: Dimensions) {
  return (
    dimensions.combined.level === "elevado" ||
    dimensions.functionalImpairment === true
  );
}

function hasWorkRisk(dimensions: Dimensions) {
  return (
    dimensions.workReintegration.level === "bajo" ||
    dimensions.workReintegrationRisk === true
  );
}
