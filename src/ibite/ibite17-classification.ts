import { calculateIbite17Dimensions } from "./ibite17-dimensions.js";
import { riskByProfile, type IbiteProfile } from "./profile-risk.js";

type Dimensions = ReturnType<typeof calculateIbite17Dimensions>;

interface SourceRecord {
  present: boolean;
  injuredHouseholdMember?: string | null;
  housingDamage?: string | null;
  temporaryDisplacement?: string | null;
  basicNeeds?: string | null;
}

export function classifyIbite17Record(
  dimensions: Dimensions,
  source: SourceRecord,
) {
  const materialRisk =
    source.housingDamage?.toLowerCase() ===
      "daños graves o vivienda no habitable." ||
    source.temporaryDisplacement?.toLowerCase() ===
      "aún no ha podido regresar." ||
    source.injuredHouseholdMember?.toLowerCase() === "sí.";
  const basicNeedsAffected = source.basicNeeds
    ? !source.basicNeeds.toLowerCase().includes("ninguna")
    : null;

  if (!source.present) {
    return {
      materialRisk,
      basicNeedsAffected,
      complete: null,
      profile: null,
      risk: null,
    };
  }
  if (dimensions.answeredCount < 15) {
    return {
      materialRisk,
      basicNeedsAffected,
      complete: false,
      profile: null,
      risk: "sin_datos_suficientes",
    } as const;
  }

  const profile = selectProfile(dimensions);
  return {
    materialRisk,
    basicNeedsAffected,
    complete: true,
    profile,
    risk: selectRisk(dimensions.safetySignal, materialRisk, profile),
  } as const;
}

function selectProfile(dimensions: Dimensions): IbiteProfile {
  const { combined, school, safetySignal, personal, family } = dimensions;
  if (
    combined.level === "elevado" ||
    dimensions.functionalImpairment ||
    school.level === "elevado" ||
    dimensions.schoolDisengagement ||
    safetySignal === "alerta" ||
    safetySignal === "no_aclarada"
  ) {
    return 3;
  }
  if (
    combined.level === "bajo" &&
    personal.level === "alto" &&
    family.level === "alto"
  ) {
    return 1;
  }
  if (combined.level === "bajo" || combined.level === "intermedio") {
    if (personal.level === "bajo" && family.level === "bajo") {
      return 4;
    }
    if ((personal.level === "bajo") !== (family.level === "bajo")) {
      return 5;
    }
  }
  return 2;
}

function selectRisk(
  safetySignal: Dimensions["safetySignal"],
  materialRisk: boolean,
  profile: IbiteProfile,
) {
  if (safetySignal === "alerta") return "critico_seguridad";
  if (safetySignal === "no_aclarada") return "alto_seguridad_no_aclarada";
  if (materialRisk) return "alto_material";
  return riskByProfile[profile];
}
