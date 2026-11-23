import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import type { SyntheticIbiteForm } from "./ibite/capture-form.js";

export async function createApp(
  swaggerEnabled: boolean,
  databaseUrl?: string,
  syntheticIbiteForm?: SyntheticIbiteForm | readonly SyntheticIbiteForm[],
  syntheticCaptureKey?: Buffer,
) {
  if (
    syntheticCaptureKey &&
    (!syntheticIbiteForm || syntheticCaptureKey.length !== 32)
  ) {
    throw new Error(
      "La clave sintética requiere un formulario de prueba y 32 bytes",
    );
  }
  if (syntheticIbiteForm) {
    const target = databaseUrl && new URL(databaseUrl);
    if (
      !target ||
      target.hostname !== "127.0.0.1" ||
      target.pathname !== "/sig_test"
    ) {
      throw new Error("La captura sintética requiere sig_test en localhost");
    }
  }
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.register(databaseUrl, syntheticIbiteForm, syntheticCaptureKey),
    new ExpressAdapter(),
    { abortOnError: false },
  );
  app.disable("x-powered-by");
  app.setGlobalPrefix("api/v1");

  if (swaggerEnabled) {
    const builder = new DocumentBuilder()
      .setTitle("Monitoreo psicosocial y SIG")
      .setVersion("0.1.0");
    if (databaseUrl) {
      builder.addBearerAuth();
    }
    const config = builder.build();
    SwaggerModule.setup("docs", app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }

  return app;
}
