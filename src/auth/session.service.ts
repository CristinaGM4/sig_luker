import { createHash, randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "../database/database.module.js";

@Injectable()
export class SessionService {
  constructor(private readonly database: DatabaseService) {}

  async issue(accountId: string, expiresAt: Date) {
    if (!(expiresAt.getTime() > Date.now())) {
      throw new RangeError("La caducidad debe ser futura");
    }

    const token = randomBytes(32).toString("base64url");
    await this.database.client.$transaction(async (transaction) => {
      const account = await transaction.account.findUnique({
        where: { id: accountId, active: true },
        select: { id: true },
      });
      if (!account) {
        throw new UnauthorizedException();
      }

      await transaction.authSession.create({
        data: { accountId, tokenDigest: digestToken(token), expiresAt },
      });
    });
    return { token, expiresAt };
  }

  async revoke(accountId: string, tokenDigest: string) {
    await this.database.client.authSession.updateMany({
      where: { accountId, tokenDigest, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async authenticate(authorization: string | undefined) {
    const token = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(
      authorization ?? "",
    )?.[1];
    if (!token) {
      throw new UnauthorizedException();
    }

    const tokenDigest = digestToken(token);
    const session = await this.database.client.authSession.findFirst({
      where: {
        tokenDigest,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        account: { active: true },
      },
      select: {
        account: {
          select: {
            id: true,
            roles: {
              select: {
                role: {
                  select: {
                    code: true,
                    permissions: {
                      select: { permission: { select: { code: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    const roles = session.account.roles.map(({ role }) => role.code).sort();
    const permissions = new Set(
      session.account.roles.flatMap(({ role }) =>
        role.permissions.map(({ permission }) => permission.code),
      ),
    );

    return {
      account: {
        accountId: session.account.id,
        roles,
        permissions: [...permissions].sort(),
      },
      tokenDigest,
    };
  }
}

export type AuthenticatedSession = Awaited<
  ReturnType<SessionService["authenticate"]>
>;

function digestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
