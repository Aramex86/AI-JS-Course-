// simple functions that agent calls

import { z } from "zod";
import { tool } from "langchain";
import { retriveRelevantChunks } from "../kb/05_retriver";

const DEFAULT_NAMESPACE = "default";
export const kbSearchTool = tool(
  async ({ question }: { question: string }) => {
    const ns = DEFAULT_NAMESPACE;
    const { docs, confidence } = await retriveRelevantChunks(question, ns, 2);

    const contexts = docs.map((doc) => {
      const source = doc?.metadata.source ?? "unknown_source";
      const chunkId = doc?.metadata.chunkId ?? doc?.metadata._chunkIndex ?? 0;

      const preview =
        doc.pageContent.length > 400
          ? doc.pageContent.slice(0, 400) + "..."
          : doc.pageContent;

      return {
        source,
        chunkId,
        preview,
      };
    });

    return {
      namespace: ns,
      contexts,
      confidence,
    };
  },
  {
    name: "kb_search",
    description: "searches the knowledge base for relevant answers",
    schema: z.object({
      question: z.string().describe("User question from kb"),
      // namespace: z.string().describe("namespace to search in"),
    }),
  },
);
