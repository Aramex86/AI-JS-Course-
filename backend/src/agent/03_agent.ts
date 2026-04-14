// define exact response from agent

import { createAgent, providerStrategy } from "langchain";
import z from "zod";
import { model } from "../utils/openai";
import { kbSearchTool } from "./02_tools";
import { AGENT_SYSTEM_PROMPT } from "./01_policy";

const AgentResponseScheema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      source: z.string(),
      chunkId: z.number(),
      preview: z.string(),
    }),
  ),
});

export const ProductAgent = createAgent({
  model: model,
  tools: [kbSearchTool],
  systemPrompt: AGENT_SYSTEM_PROMPT,
  responseFormat: providerStrategy(AgentResponseScheema),
});

export async function runProductAgent(
  messages: { role: string; content: string }[],
): Promise<{ answer: string; citations: any[] }> {
  const result: any = await ProductAgent.invoke({ messages });

  if (result.structuredResponse) {
    return {
      answer: result?.structuredResponse?.answer,
      citations: result?.structuredResponse?.citations ?? [],
    };
  }

  // fallback

  return {
    answer: "",
    citations: [],
  };
}
