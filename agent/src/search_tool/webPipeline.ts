import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { openUrl } from "../utils/openUrl";
import { summarize } from "../utils/summarize";
import { candidate } from "./types";
import { getChatModel } from "../shared/models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const setTopResult = 5;

export const webSearchStep = RunnableLambda.from(
  async (input: { q: string; mode: "web" | "direct" }) => {
    const results = await webSearch(input.q);

    return {
      ...input,
      results,
    };
  },
);

export const openAndSummarizeStep = RunnableLambda.from(
  async (input: { q: string; mode: "web" | "direct"; results: any[] }) => {
    if (!Array.isArray(input.results) || input.results.length === 0) {
      return { ...input, summary: [], fallback: "no results" as const };
    }

    const extractTopResults = input.results.slice(0, setTopResult);

    const setteledResults = await Promise.allSettled(
      extractTopResults.map(async (result: any) => {
        const opened = await openUrl(result.url);

        const summarizedContent = await summarize(opened.content);

        return {
          url: opened.url,
          summary: summarizedContent.summary,
        };
      }),
    );

    const setteledResultsSuccess = setteledResults
      .filter((r: any) => r.status === "fulfilled")
      .map((r: any) => r.value);

    if (setteledResultsSuccess.length === 0) {
      const fallbackSnippetSummaries = extractTopResults
        .map((result: any) => ({
          url: result.url,
          summary: String(result.snippet || result.title || "").trim(),
        }))
        .filter((x: any) => x.summary.length > 0);

      return {
        ...input,
        pageSummaries: fallbackSnippetSummaries,
        fallback: "snippets" as const,
      };
    }
  },
);

export const stepComposeStep = RunnableLambda.from(
  async (input: {
    q: string;
    mode: "web" | "direct";
    pageSummaries: Array<{ url: string; summary: string }>;
    fallback: "snippets" | "no results" | "none";
  }): Promise<candidate> => {
    const model = getChatModel({ temperature: 0.2 });

    if (!input.pageSummaries || input.pageSummaries.length === 0) {
      const directResponseAnswer = await model.invoke([
        new SystemMessage(
          [
            "You answer briefly and clearly for beginners",
            "If unsure, say so",
          ].join("\n"),
        ),
        new HumanMessage(input.q),
      ]);

      const directAnswer =
        typeof directResponseAnswer.content === "string"
          ? directResponseAnswer.content
          : String(directResponseAnswer.content).trim();

      return {
        answer: directAnswer,
        sources: [],
        mode: "direct",
      };
    }

    const res = await model.invoke([
      new SystemMessage(
        [
          "You concisely answer questions using provided page summaries",
          "Rules:",
          "- Be accurate and netral",
          "- 5-8 sentences max",
          "- Use only the provided summaries; do not invent new facts",
        ].join("\n"),
      ),
      new HumanMessage(
        [
          `Question: ${input.q}`,
          "Summaries:",
          JSON.stringify(input.pageSummaries, null, 2),
        ].join("\n"),
      ),
    ]);

    const finalAnswer =
      typeof res.content === "string"
        ? res.content
        : String(res.content).trim();

    return {
      answer: finalAnswer,
      sources: input.pageSummaries.map((x) => x.url),
      mode: "web",
    };
  },
);

export const webBasePath = RunnableSequence.from([
  webSearchStep,
  openAndSummarizeStep,
  stepComposeStep,
]);
