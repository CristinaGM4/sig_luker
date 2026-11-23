import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import { SessionService } from "./session.service.js";
import type { AuthenticatedSession } from "./session.service.js";

export const RequiresPermissions = Reflector.createDecorator<string[]>();

export interface AuthenticatedRequest extends Request {
  authenticatedSession: AuthenticatedSession;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();
    response.setHeader("Cache-Control", "no-store");
    let session: AuthenticatedSession;
    try {
      session = await this.sessions.authenticate(request.headers.authorization);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        response.setHeader("WWW-Authenticate", "Bearer");
      }
      throw error;
    }
    const required = this.reflector.getAllAndMerge(RequiresPermissions, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (
      required.some(
        (permission) => !session.account.permissions.includes(permission),
      )
    ) {
      throw new ForbiddenException();
    }

    request.authenticatedSession = session;
    return true;
  }
}
