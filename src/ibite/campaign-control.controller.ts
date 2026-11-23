import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  RequiresPermissions,
  SessionGuard,
  type AuthenticatedRequest,
} from "../auth/session.guard.js";
import { DatabaseService } from "../database/database.module.js";
import type { Prisma } from "../generated/prisma/client.js";

const permission = "ibite:campaign-control";

@ApiTags("Campañas IBITE internas")
@ApiBearerAuth()
@UseGuards(SessionGuard)
@RequiresPermissions([permission])
@Controller("interno/campanas-ibite")
export class IbiteCampaignControlController {
  constructor(private readonly database: DatabaseService) {}

  @Put(":campanaId/estado")
  @HttpCode(204)
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["enabled"],
      properties: { enabled: { type: "boolean" } },
    },
  })
  @ApiNoContentResponse({ description: "Estado aplicado" })
  @ApiResponse({ status: 400, description: "Identificador o carga inválida" })
  @ApiResponse({ status: 401, description: "Sesión inválida" })
  @ApiResponse({ status: 403, description: "Permiso insuficiente" })
  @ApiResponse({
    status: 404,
    description: "Campaña fuera de ámbito o inexistente",
  })
  async setEnabled(
    @Param("campanaId", ParseUUIDPipe) id: string,
    @Body() body: { enabled?: unknown } | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (
      !body ||
      typeof body.enabled !== "boolean" ||
      Object.keys(body).length !== 1
    ) {
      throw new BadRequestException("Estado de campaña inválido");
    }
    const { enabled } = body;
    const { accountId } = request.authenticatedSession.account;
    const scope: Prisma.IbiteCampaignWhereInput = {
      id,
      instrumentCode: "IBITE-17",
      institution: {
        active: true,
        accounts: {
          some: {
            accountId,
            account: {
              active: true,
              roles: {
                some: {
                  role: {
                    permissions: { some: { permission: { code: permission } } },
                  },
                },
              },
            },
          },
        },
      },
    };
    await this.database.client.$transaction(async (tx) => {
      const changes = await tx.ibiteCampaign.updateManyAndReturn({
        where: { ...scope, enabled: !enabled },
        data: { enabled },
        select: { institutionId: true },
      });
      if (changes.length === 0) {
        const scoped = await tx.ibiteCampaign.findFirst({
          where: scope,
          select: { id: true },
        });
        if (!scoped) throw new NotFoundException();
        return;
      }
      await tx.auditEvent.create({
        data: {
          actorId: accountId,
          action: enabled
            ? "ibite.campaign.enabled"
            : "ibite.campaign.disabled",
          targetId: id,
          institutionId: changes[0].institutionId,
        },
      });
    });
  }
}
