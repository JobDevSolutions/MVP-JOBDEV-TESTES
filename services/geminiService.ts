
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, FileSystem, Iteration } from "../types";

const SYSTEM_INSTRUCTION = `Você é a engine de desenvolvimento da JOBDEV SOLUTIONS.
Sua missão é criar e manter exclusivamente FERRAMENTAS DE CHAT E MENSAGERIA.

PROTOCOLO DE ATUAÇÃO:
1. NOVOS PROJETOS: Sempre crie interfaces de chat, bots ou sistemas de mensageria completos.
2. EDIÇÕES E CORREÇÕES: Se já houver código, atenda a QUALQUER pedido de correção, melhoria técnica ou implementação nova, desde que o projeto continue sendo uma ferramenta de chat.
3. ESTILO: Use Tailwind CSS (via CDN). O design deve ser premium, preferencialmente dark mode, com alta usabilidade para conversação.
4. INTEGRIDADE: Nunca remova funcionalidades existentes a menos que seja para substituí-las por algo melhor ou se solicitado.
5. RESPOSTA: Retorne estritamente o JSON com "description" e "files" (lista de {path, content}).

Se o usuário tentar transformar drasticamente o chat em algo não relacionado (ex: um e-commerce), mantenha o foco em funcionalidades de chat dentro desse novo contexto ou decline se for impossível manter a natureza de mensageria.`;

export async function generateProjectUpdate(
  prompt: string,
  history: Iteration[],
  currentFiles: FileSystem
): Promise<AIResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const filesContext = Object.entries(currentFiles).length > 0
    ? `CÓDIGO ATUAL DO CHAT:\n${JSON.stringify(currentFiles, null, 2)}`
    : "PROJETO INICIAL: Criando solução de mensageria.";

  const fullPrompt = `
HISTÓRICO DE ITERAÇÕES: ${history.length} versões anteriores.
${filesContext}

SOLICITAÇÃO DO DESENVOLVEDOR:
${prompt}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Breve resumo do que foi alterado ou criado." },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["description", "files"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    const fileSystem: FileSystem = {};
    if (Array.isArray(result.files)) {
      result.files.forEach((file: any) => {
        fileSystem[file.path] = file.content;
      });
    }

    return { description: result.description || "", files: fileSystem };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
