import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from './config';
import { processPdf } from './lib/retrieval/pdf';
import { generateEmbeddings } from './lib/ai/embeddings';
const db = drizzle(DATABASE_URL);


generateEmbeddings('./files/billetes_va03okx_va03rrp.pdf')