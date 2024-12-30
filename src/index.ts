import { findRelevantContent } from "./lib/ai/embeddings";
import { OPENAI_API_KEY } from "./config";
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { processPdf } from "./lib/retrieval/pdf";
import { FileItemChunk } from "./types";

// Definir interfaces
interface AnalisisFactura {
  cumple?: boolean;
  incumplimientos?: string[];
  resumen?: string;
}

async function analizarFactura(): Promise<AnalisisFactura> {
  // Obtener políticas relevantes
  const detallesFactura: FileItemChunk[] = await processPdf('files/billetes_va03okx_va03rrp.pdf')

  const politicasRelevantes = await findRelevantContent(detallesFactura.map(f => f.content).join('\n'));
  
  const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
    compatibility: 'strict',
  });

  const prompt = `
  Analiza los siguientes detalles de una factura y verifica si cumple con las políticas de la empresa.
  Debes responder en un formato estructurado.

  Detalles de la factura:
  ${detallesFactura}

  Políticas relevantes:
  ${politicasRelevantes.map(p => p.name).join('\n')}

  Genera un análisis detallado considerando todas las políticas aplicables.
  `;

  const { object, usage } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      cumple: z.boolean().describe('Indica si la factura cumple con las políticas'),
      incumplimientos: z.array(z.string()).describe('Lista de incumplimientos encontrados'),
      resumen: z.string().describe('Resumen del análisis')
    }),
    prompt: prompt,
  });
  console.log("usage", usage)
  return object;
}

analizarFactura()
  .then(resultado => console.log(JSON.stringify(resultado, null, 2)))
  .catch(error => console.error('Error:', error));