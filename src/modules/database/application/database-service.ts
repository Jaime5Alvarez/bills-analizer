import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '../../../db/schema';

import { IDatabaseService } from '../domain/interfaces';
import { DrizzleClient } from '../infrastructure/drizzle/drizzle-client';

export class DatabaseService implements IDatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getConnection(): PostgresJsDatabase<typeof schema> {
    return DrizzleClient.getInstance();
  }

  public async closeConnection(): Promise<void> {
    await DrizzleClient.disconnect();
  }
}
