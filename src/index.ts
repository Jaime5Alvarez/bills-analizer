import { OPENAI_API_KEY } from "./config";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import fs from 'fs';

// Definir interfaces
interface AnalisisFactura {
  cumple?: boolean;
  incumplimientos?: string[];
  resumen?: string;
}

async function analizarFactura(): Promise<AnalisisFactura> {
  const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
    compatibility: "strict",
  });

  // Leer la imagen de la factura
  const facturaBase64 = fs.readFileSync(
    "files/factura-MDB-SOLUTIONS-2-DICIEMBRE-2023.pdf",
    { encoding: 'base64' }
  );

  const prompt = `
# Instrucciones de Análisis de Factura

Eres un experto en auditoría de facturas. Analiza la factura proporcionada y responde en el siguiente formato:

## Formato de Respuesta
1. Cumplimiento: (Sí/No)
2. Incumplimientos: [Lista detallada de los problemas encontrados]
3. Resumen: (Un resumen breve del análisis)
`;

  const { object, usage } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      cumple: z.boolean(),
      incumplimientos: z.array(z.string()),
      resumen: z.string(),
    }),
    prompt: prompt,
    images: [{
      base64: facturaBase64,
      type: "image/pdf"
    }],
  });

  console.log("usage", usage);
  return object;
}

analizarFactura()
  .then((resultado) => console.log(JSON.stringify(resultado, null, 2)))
  .catch((error) => console.error("Error:", error));
