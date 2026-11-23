import { DynamicModule, Module } from "@nestjs/common";
import { CatalogsModule } from "./catalogs/catalogs.module.js";
import { HealthController } from "./health.controller.js";
import type { SyntheticIbiteForm } from "./ibite/capture-form.js";

@Module({ controllers: [HealthController] })
export class AppModule {
  static register(
    databaseUrl?: string,
    syntheticIbiteForm?: SyntheticIbiteForm | readonly SyntheticIbiteForm[],
    syntheticCaptureKey?: Buffer,
  ): DynamicModule {
    return {
      module: AppModule,
      imports: databaseUrl
        ? [
            CatalogsModule.register(
              databaseUrl,
              syntheticIbiteForm,
              syntheticCaptureKey,
            ),
          ]
        : [],
    };
  }
}
