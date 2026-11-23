import {
  Controller,
  Get,
  Header,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DatabaseService } from "./database.service.js";

@ApiTags("Salud")
@Controller("ready")
export class ReadinessController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["status"],
      properties: { status: { type: "string", enum: ["ready"] } },
    },
  })
  @ApiServiceUnavailableResponse({
    schema: {
      type: "object",
      required: ["status"],
      properties: { status: { type: "string", enum: ["unavailable"] } },
    },
  })
  async readiness() {
    try {
      await this.database.verifyConnection();
    } catch {
      throw new ServiceUnavailableException({ status: "unavailable" });
    }

    return { status: "ready" } as const;
  }
}
