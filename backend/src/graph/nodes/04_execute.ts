import { z } from "zod";
import { env } from "../../utils/env";
import { ChatOpenAI } from "@langchain/openai";
import { State } from "../types";
const NotesSchema = z.object({
  notes: z.array(z.string().min(1).max(500)).max(20).min(1),
});

type Notes = z.infer<typeof NotesSchema>;

function makeModal() {
  return new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    temperature: 1,
  });
}
function createHumanContent(steps: string[]) {
  const list = JSON.stringify(steps, null, 0);

  return [
    "You are concise assistant ",
    'Given a list of steps, return a JSON object {"notes": string[]} ',
    "Rules:",
    "notes.length should be equal to steps.length",
    "Each note <= 500 characters'",
    "Plain text, no markdown or formatting",
    `Steps = ${list}`,
  ].join("\n");
}

export async function executeNode(state: any): Promise<Partial<State>> {
  if (!state.approved) return {};

  const steps = state.steps || [];

  if (steps.length === 0) return {};

  const model = makeModal();

  const stucturedResponse = model.withStructuredOutput(NotesSchema);

  const notes = await stucturedResponse.invoke([
    {
      role: "system",
      content: "Return only valid JSON matching the following schema.",
    },
    { role: "human", content: createHumanContent(steps) },
  ]);

  const count = Math.min(steps.length, notes.notes.length);

  const results = Array.from({ length: count }, (_, i) => ({
    step: steps[i],
    note: notes.notes[i],
  }));

  return {
    results,
    status: "done",
    message: `Execution completed successfully. ${results.length} steps executed.`,
  };
}
