import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { Request, Response } from "express";

const windowMs = 60_000;
const attemptsPerWindow = 20;
const maxTrackedAddresses = 10_000;

@Injectable()
export class PublicCaptureLimitGuard implements CanActivate {
  private readonly addresses = new Map<
    string,
    { count: number; deadline: number }
  >();

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const address = http.getRequest<Request>().socket.remoteAddress ?? "";
    const response = http.getResponse<Response>();
    response.setHeader("Cache-Control", "no-store");
    const now = performance.now();
    // Windows are inserted in deadline order.
    for (const [key, entry] of this.addresses) {
      if (entry.deadline > now) break;
      this.addresses.delete(key);
    }
    const current = this.addresses.get(address);
    if (current && current.count < attemptsPerWindow) {
      current.count++;
      return true;
    }
    if (!current && this.addresses.size < maxTrackedAddresses) {
      this.addresses.set(address, { count: 1, deadline: now + windowMs });
      return true;
    }
    const deadline =
      current?.deadline ??
      this.addresses.values().next().value?.deadline ??
      now + windowMs;
    response.setHeader(
      "Retry-After",
      String(Math.max(1, Math.ceil((deadline - now) / 1000))),
    );
    throw new HttpException(
      "Demasiadas solicitudes de inicio",
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
