import { findRelevantContent } from "./lib/ai/embeddings";
import { OPENAI_API_KEY } from "./config";
import { createOpenAI } from '@ai-sdk/openai';

import { generateObject } from 'ai';
import { z } from 'zod';
async function analizarFactura(detallesFactura: string) {
  // Obtener políticas relevantes
  const politicasRelevantes = await findRelevantContent(detallesFactura);
    const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
    compatibility: 'strict',
  });
  // Crear el prompt para el análisis
  const prompt = `
  Analiza los siguientes detalles de una factura y verifica si cumple con las políticas de la empresa:

  Detalles de la factura:
  ${detallesFactura}

  Políticas relevantes:
  ${politicasRelevantes.map(p => p.name).join('\n')}

  Por favor, indica:
  1. Si la factura cumple con las políticas
  2. Qué políticas específicas cumple o incumple
  3. Recomendaciones para corregir cualquier incumplimiento
  `;


const { object } = await generateObject({
  model: openai('gpt-4o-mini'),
  schema: z.object({
    analysis: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: prompt,
});

return object
}

// Ejemplo de uso
const ejemploFactura = `
Fecha: 2024-03-15
Proveedor: Empresa XYZ
Monto: $1,500
Conceptos:
- Servicios de consultoría
- Gastos de viaje
- Material de oficina
`;

analizarFactura(ejemploFactura)
  .then(resultado => console.log(resultado))
  .catch(error => console.error('Error:', error));