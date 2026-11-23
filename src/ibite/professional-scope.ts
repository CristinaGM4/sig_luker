import type { Prisma } from "../generated/prisma/client.js";

export function currentProfessionalScope(
  accountId: string,
  permission: "records:read" | "records:create" | "audit:read",
): Prisma.ProfessionalInstitutionWhereInput {
  return {
    professionalId: accountId,
    revokedAt: null,
    professional: {
      active: true,
      AND: [
        { roles: { some: { role: { code: "PSYCHOSOCIAL_SUPPORT" } } } },
        {
          roles: {
            some: {
              role: {
                permissions: { some: { permission: { code: permission } } },
              },
            },
          },
        },
      ],
    },
  };
}
