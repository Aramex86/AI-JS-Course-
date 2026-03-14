import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/models";
import { SummarizeInputSchema, SummarizeOutputSchema } from "./schemas";

export async function summarize(text: string) {
  const { text: raw } = SummarizeInputSchema.parse({ text });

  const clipped = clip(raw, 4000);

  const model = getChatModel({ temperature: 0.2 });

  const res = await model.invoke([
    new SystemMessage(
      [
        "You are a helpful assistant that writes short,acurate summaries.",
        "Guidelines:",
        "- Be factural and neutral , avoid marketing language",
        "- 5-8 sentances; no lists unless absolutely necessary",
        "- Do NOT invent sources, you only summarize the provided text",
        "- Keep it readable for beginners",
      ].join("\n"),
    ),

    new HumanMessage(
      [
        "Summarize the following content for a beginner friendly audience",
        "Focus on key fatcs and remove fuff",
        "TEXT",
        clipped,
      ].join("\n\n"),
    ),
  ]);

  const rawModelOutput =
    typeof res.content === "string" ? res.content : String(res.content);

  const summary = normalizeSummary(rawModelOutput);

  return SummarizeOutputSchema.parse({ summary });
}

function clip(s: string, max: number) {
  return s.length > max ? s.slice(0, max) : s;
}

function normalizeSummary(s: string) {
  const t = s
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  return t.slice(0, 2500);
}
