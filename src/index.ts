import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from './config';
import { processPdf } from './lib/retrieval/pdf';
const db = drizzle(DATABASE_URL);

processPdf()