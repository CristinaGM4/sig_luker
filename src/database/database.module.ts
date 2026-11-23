import { DynamicModule, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";
import { ReadinessController } from "./readiness.controller.js";

export { DatabaseService } from "./database.service.js";

@Module({ controllers: [ReadinessController] })
export class DatabaseModule {
  static register(databaseUrl: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => new DatabaseService(databaseUrl),
        },
      ],
      exports: [DatabaseService],
    };
  }
}
