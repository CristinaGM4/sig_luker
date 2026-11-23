import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SessionService } from "./session.service.js";
import { SessionGuard } from "./session.guard.js";
import type { AuthenticatedRequest } from "./session.guard.js";

@ApiTags("Sesión")
@ApiBearerAuth()
@Controller("auth")
@UseGuards(SessionGuard)
export class AuthController {
  constructor(private readonly sessions: SessionService) {}
  @Get("me")
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({
    description: "Identidad técnica de la sesión activa",
    schema: {
      type: "object",
      required: ["accountId", "roles", "permissions"],
      properties: {
        accountId: { type: "string", format: "uuid" },
        roles: { type: "array", items: { type: "string" } },
        permissions: { type: "array", items: { type: "string" } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Sesión inválida o ausente" })
  getCurrentAccount(@Req() request: AuthenticatedRequest) {
    return request.authenticatedSession.account;
  }

  @Delete("session")
  @HttpCode(204)
  @Header("Cache-Control", "no-store")
  @ApiNoContentResponse({ description: "Sesión revocada" })
  @ApiUnauthorizedResponse({ description: "Sesión inválida o ausente" })
  async revokeCurrentSession(@Req() request: AuthenticatedRequest) {
    const { account, tokenDigest } = request.authenticatedSession;
    await this.sessions.revoke(account.accountId, tokenDigest);
  }
}
