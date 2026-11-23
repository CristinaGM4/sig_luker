import { observeIbiteSafety } from "./safety-observations.js";
import {
  calculateIbite17Dimensions,
  IBITE17_DIMENSIONS_VERSION,
} from "./ibite17-dimensions.js";
import { classifyIbite17Record } from "./ibite17-classification.js";
import { selectIbite17Orientation } from "./ibite17-orientation.js";
import {
  calculateIbiteDa28Dimensions,
  IBITE_DA28_DIMENSIONS_VERSION,
} from "./ibite-da28-dimensions.js";
import { classifyIbiteDa28Record } from "./ibite-da28-classification.js";
import { selectIbiteDa28Orientation } from "./ibite-da28-orientation.js";

interface InstrumentReference {
  instrumentCode: string;
  variant: string;
  sourceVersion: string;
  ruleVersion: string;
  sourceSha256: string;
  itemCount: number;
}

type SourceRecord = Parameters<typeof classifyIbite17Record>[1];

export function calculateIbiteReference(
  reference: InstrumentReference,
  answers: readonly (string | null)[],
  source: SourceRecord,
) {
  if (reference.instrumentCode === "IBITE-17") {
    if (
      (reference.variant !== "CAREGIVER" &&
        reference.variant !== "ADOLESCENT") ||
      reference.ruleVersion !== IBITE17_DIMENSIONS_VERSION ||
      reference.itemCount !== 17
    ) {
      throw new RangeError("Referencia incompatible con IBITE-17");
    }

    const dimensions = calculateIbite17Dimensions(answers);
    const classification = classifyIbite17Record(dimensions, source);
    return {
      reference,
      dimensions,
      classification,
      safetyObservations: observeIbiteSafety(dimensions.items, "IBITE-17"),
      orientation: selectIbite17Orientation(
        dimensions,
        classification,
        reference.variant === "CAREGIVER" ? "A" : "B",
      ),
    };
  }

  if (
    reference.instrumentCode !== "IBITE-DA-28" ||
    reference.variant !== "EDUCATIONAL_STAFF" ||
    reference.ruleVersion !== IBITE_DA28_DIMENSIONS_VERSION ||
    reference.itemCount !== 28
  ) {
    throw new RangeError("Referencia incompatible con IBITE-DA-28");
  }

  const dimensions = calculateIbiteDa28Dimensions(answers);
  const classification = classifyIbiteDa28Record(dimensions, source.present);
  return {
    reference,
    dimensions,
    classification,
    safetyObservations: observeIbiteSafety(dimensions.items, "IBITE-DA-28"),
    orientation: selectIbiteDa28Orientation(dimensions, classification),
  };
}
