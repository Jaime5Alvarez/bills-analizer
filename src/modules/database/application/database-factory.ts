import { DatabaseService } from './database-service';
import { IDatabaseService } from '../domain/interfaces';

export function DatabaseServiceFactory(): IDatabaseService {
  return DatabaseService.getInstance();
}
