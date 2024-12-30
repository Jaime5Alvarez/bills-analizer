import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { encode } from "gpt-tokenizer"

import { FileItemChunk } from "../../types/index"

import { CHUNK_SIZE, CHUNK_OVERLAP } from "./index"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const processPdf = async (): Promise<FileItemChunk[]> => {
  const loader = new PDFLoader("./files/billetes_va03okx_va03rrp.pdf")
  const docs = await loader.load()
  let completeText = docs.map(doc => doc.pageContent).join(" ")

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP
  })
  const splitDocs = await splitter.createDocuments([completeText])

  let chunks: FileItemChunk[] = []

  for (let i = 0; i < splitDocs.length; i++) {
    const doc = splitDocs[i]

    chunks.push({
      content: doc.pageContent,
      tokens: encode(doc.pageContent).length
    })
  }

  console.log(chunks)
  return chunks
}
