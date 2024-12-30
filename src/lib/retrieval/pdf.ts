import { encode } from "gpt-tokenizer"
/* import pdf2md from '@opendocsg/pdf2md'*/
import * as fs from 'fs'

import { FileItemChunk } from "../../types/index"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CHUNK_SIZE, CHUNK_OVERLAP } from "./index"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import pdf2md from "@opendocsg/pdf2md";

export const processPdf = async (path: string): Promise<FileItemChunk[]> => {
  
    // Verificar si el archivo existe
    if (!fs.existsSync(path)) {
      throw new Error(`El archivo PDF no existe en la ruta: ${path}`);
    }
  const pdfBuffer = fs.readFileSync(path)

  // Convertir PDF a Markdown
  const markdown = await pdf2md(pdfBuffer)

/*     const loader = new PDFLoader(path)
    const docs = await loader.load()
    let completeText = docs.map(doc => doc.pageContent).join(" ") */

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP
    })
    
    const splitDocs = await splitter.createDocuments([markdown])
    
    let chunks: FileItemChunk[] = []
    
    for (let i = 0; i < splitDocs.length; i++) {
      const doc = splitDocs[i]
      chunks.push({
        content: doc.pageContent,
        tokens: encode(doc.pageContent).length
      })
    }

    return chunks
  } 