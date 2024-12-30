import { OPENAI_API_KEY } from "./config";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import fs from "fs";
import { processPdf } from "./lib/retrieval/pdf";

// Definir interfaces
interface AnalisisFactura {
  cumple?: boolean;
  incumplimientos?: string[];
  resumen?: string;
}

async function analizarFactura(): Promise<AnalisisFactura> {
  const openaiSdk = createOpenAI({
    apiKey: OPENAI_API_KEY,
    compatibility: "strict",
  });

  // Cargar las políticas de la empresa
  const politicasEmpresa = await processPdf("files/politicas de empresa.pdf");

  const systemPrompt = `#ROLE
  Eres un experto en auditoría de facturas que analiza documentos detalladamente.
  El usuario te proporcionará una factura y tú tendrás que analizarla y devolver el análisis en el formato especificado.
  
  #POLÍTICAS DE LA EMPRESA
  ${politicasEmpresa.map((p) => `- ${p.content}`).join("\n")}`;

  const { text, experimental_output, usage } = await generateText({
    model: openaiSdk("gpt-4o-mini"),
    system: systemPrompt,
    experimental_output: Output.object({
      schema: z.object({
        cumplimiento: z
          .boolean()
          .describe("Indica si la factura cumple con las políticas"),
        incumplimientos: z
          .array(z.string())
          .describe(
            "Lista de problemas encontrados con la cita de la política que incumple"
          ),
        resumen: z.string().describe("Resumen detallado de la factura"),
      }),
    }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analiza la factura proporcionada y comprueba si cumple con las políticas de la empresa`,
          },
          {
            type: "image",
            image: fs.readFileSync("files/factura-mdb.png", {
              encoding: "base64",
            }),
          },
        ],
      },
    ],
  });

  console.log("usage", usage);

  return experimental_output;
}

analizarFactura()
  .then((resultado) => console.log(JSON.stringify(resultado, null, 2)))
  .catch((error) => console.error("Error:", error));
