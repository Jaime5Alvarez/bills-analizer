import { InferSelectModel } from 'drizzle-orm';
import {
  uuid,
  index,
  text,
  vector,
  pgTable,
} from 'drizzle-orm/pg-core';

export const embeddings = pgTable('embeddings',
    {
      id: uuid('id').primaryKey().notNull().defaultRandom(),
      content: text('content').notNull(),
      embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    },
    (table) => [
      index('embeddingIndex').using(
        'hnsw',
        table.embedding.op('vector_cosine_ops')
      ),
    ]
);
  
  export type Embedding = InferSelectModel<typeof embeddings>;