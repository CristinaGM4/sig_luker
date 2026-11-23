import { DynamicModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { AuthController } from "./auth.controller.js";
import { SessionGuard } from "./session.guard.js";
import { SessionService } from "./session.service.js";

@Module({
  controllers: [AuthController],
  providers: [SessionService, SessionGuard],
  exports: [DatabaseModule, SessionService, SessionGuard],
})
export class AuthModule {
  static register(databaseUrl: string): DynamicModule {
    return {
      module: AuthModule,
      imports: [DatabaseModule.register(databaseUrl)],
    };
  }
}
