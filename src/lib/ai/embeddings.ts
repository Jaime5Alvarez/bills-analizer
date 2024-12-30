import { embed, embedMany } from "ai";
import { cosineDistance, desc, gt, sql, and, eq } from "drizzle-orm";

import { embeddings } from "../../db/schema";

import { processPdf } from "../retrieval/pdf";
import { DatabaseServiceFactory } from "../../modules/database/application/database-factory";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-ada-002");
const db = DatabaseServiceFactory().getConnection();
export const generateEmbeddings = async (
  path: string
): Promise<void> => {
  const fileChunks = await processPdf(path);

  const chunks = fileChunks.map((chunk) => chunk.content);
  const { embeddings: embeddingsResult, usage } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  const embeddingsMapped = embeddingsResult.map((e, i) => ({ content: chunks[i], embedding: e }));
  await db.insert(embeddings).values(
    embeddingsMapped.map((embedding) => ({
      content: embedding.content.replace(/\x00/g, ''),
      embedding: embedding.embedding,
    }))
  );
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replace(/\\n/g, " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (
  userQuery: string,
  chatId: string
) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};
