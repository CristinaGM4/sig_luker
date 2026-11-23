import { createHmac } from "node:crypto";
import { BadRequestException } from "@nestjs/common";

export function readCaptureIdentity(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new BadRequestException("Identificación inválida");
  }
  const { age, documentNumber, studentName, contactPhone } = body as Record<
    string,
    unknown
  >;
  if (
    typeof age !== "number" ||
    !Number.isInteger(age) ||
    age < 5 ||
    age > 19 ||
    typeof documentNumber !== "string" ||
    !/^[0-9]{4,24}$/.test(documentNumber.trim())
  ) {
    throw new BadRequestException("Edad o documento inválidos");
  }
  const document = documentNumber.trim();
  if (age >= 11 && Object.keys(body).length === 2) {
    return { variant: "ADOLESCENT", key: [document] } as const;
  }
  if (
    age < 11 &&
    Object.keys(body).length === 4 &&
    typeof studentName === "string" &&
    studentName.length <= 180 &&
    typeof contactPhone === "string" &&
    contactPhone.length <= 30
  ) {
    const name = studentName
      .normalize("NFKC")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
    const phone = contactPhone.replace(/[\s()+-]/g, "");
    if (name && /^[0-9]{7,15}$/.test(phone)) {
      return { variant: "CAREGIVER", key: [document, name, phone] } as const;
    }
  }
  throw new BadRequestException("Identificación inválida para esta edad");
}

export function captureIdentityDigest(
  secret: Buffer,
  periodId: string,
  identity: ReturnType<typeof readCaptureIdentity>,
) {
  return createHmac("sha256", secret)
    .update(JSON.stringify([periodId, identity.variant, ...identity.key]))
    .digest("hex");
}
