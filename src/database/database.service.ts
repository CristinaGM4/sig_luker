import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createDatabaseClient } from "./database-client.js";

export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly client;

  constructor(databaseUrl: string) {
    this.client = createDatabaseClient(databaseUrl);
  }

  async onModuleInit() {
    try {
      await this.client.$connect();
      await this.verifyConnection();
    } catch {
      await this.client.$disconnect();
      throw new Error("No se pudo conectar a PostgreSQL");
    }
  }

  async verifyConnection() {
    await this.client.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
