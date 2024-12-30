import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../../../../db/schema';
import { DATABASE_URL } from '../../../../config';

export class DrizzleClient {
  private static instance: PostgresJsDatabase<typeof schema>;
  private static client: postgres.Sql;

  private constructor() {}

  public static getInstance(): PostgresJsDatabase<typeof schema> {
    if (!DrizzleClient.instance) {
      const postgresUrl = DATABASE_URL;
      if (!postgresUrl) {
        throw new Error('PostgreSQL URL is not defined');
      }

      DrizzleClient.client = postgres(postgresUrl);
      DrizzleClient.instance = drizzle(DrizzleClient.client, {
        schema: schema,
      });
    }
    return DrizzleClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DrizzleClient.client) {
      await DrizzleClient.client.end();
    }
  }
}
