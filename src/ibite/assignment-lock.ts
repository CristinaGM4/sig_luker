import type { Prisma } from "../generated/prisma/client.js";

export async function lockOwnedAssignment(
  tx: Prisma.TransactionClient,
  assignmentId: string,
  accountId: string,
) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT assignment.id FROM ibite_assignments AS assignment
    JOIN ibite_campaigns AS campaign ON campaign.id = assignment.campaign_id
    WHERE assignment.id = ${assignmentId}::uuid
      AND assignment.respondent_id = ${accountId}::uuid
    FOR UPDATE OF assignment FOR SHARE OF campaign
  `;
  return rows.length === 1;
}
