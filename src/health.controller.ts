import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Salud")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Comprueba que el proceso HTTP responde" })
  @ApiOkResponse({
    description: "Proceso HTTP disponible",
    schema: {
      type: "object",
      required: ["status"],
      properties: { status: { type: "string", enum: ["ok"] } },
    },
  })
  getHealth() {
    return { status: "ok" } as const;
  }
}
