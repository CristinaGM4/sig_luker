import type { Prisma } from "../generated/prisma/client.js";

export function availableIbiteAssignments(
  accountId: string,
  now: Date,
): Prisma.IbiteAssignmentWhereInput {
  return {
    respondentId: accountId,
    revokedAt: null,
    respondent: {
      active: true,
      roles: {
        some: {
          role: {
            permissions: {
              some: { permission: { code: "ibite:complete" } },
            },
          },
        },
      },
    },
    campaign: {
      enabled: true,
      opensAt: { lte: now },
      closesAt: { gt: now },
      institution: { active: true },
    },
  };
}
