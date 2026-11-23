import { IBITE_DA28_DIMENSIONS_VERSION } from "../ibite/ibite-da28-dimensions.js";
import { IBITE17_DIMENSIONS_VERSION } from "../ibite/ibite17-dimensions.js";
import type { Prisma } from "../generated/prisma/client.js";

const ibite17 = {
  instrumentCode: "IBITE-17",
  sourceVersion: "manizales-respuestas-23",
  ruleVersion: IBITE17_DIMENSIONS_VERSION,
  sourceSha256:
    "9d7b11c584f21741b1abe9edab746eefa41458923bc43dc0b26a07f74c33780e",
  itemCount: 17,
} as const;

const versions = [
  { ...ibite17, variant: "CAREGIVER" },
  { ...ibite17, variant: "ADOLESCENT" },
  {
    instrumentCode: "IBITE-DA-28",
    variant: "EDUCATIONAL_STAFF",
    sourceVersion: "da-manizales-respuestas",
    ruleVersion: IBITE_DA28_DIMENSIONS_VERSION,
    sourceSha256:
      "9cf23fe0adc3192d4884d972b1a7b01aac16af5402323e1e333ce0be3a0faa25",
    itemCount: 28,
  },
] as const;

export async function seedInstrumentCatalog(
  transaction: Prisma.TransactionClient,
) {
  await transaction.instrument.createMany({
    data: [{ code: "IBITE-17" }, { code: "IBITE-DA-28" }],
    skipDuplicates: true,
  });
  await transaction.instrumentVersion.createMany({
    data: [...versions],
    skipDuplicates: true,
  });

  for (const entry of versions) {
    const { instrumentCode, variant, sourceVersion } = entry;
    const stored = await transaction.instrumentVersion.findUniqueOrThrow({
      where: {
        instrumentCode_variant_sourceVersion: {
          instrumentCode,
          variant,
          sourceVersion,
        },
      },
    });
    if (
      stored.ruleVersion !== entry.ruleVersion ||
      stored.sourceSha256 !== entry.sourceSha256 ||
      stored.itemCount !== entry.itemCount
    ) {
      throw new Error("Los metadatos de una versión IBITE no coinciden");
    }
  }
}
