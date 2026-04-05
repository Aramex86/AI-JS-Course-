import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../../utils/env";
import { State } from "../types";

export const PlanSchema = z.object({
  step: z
    .array(z.string())
    .min(3, "Keep each step a short sentence")
    .max(150, "Keep each step coincise")
    .min(1)
    .max(10),
});

type Plan = z.infer<typeof PlanSchema>;

function makeModal() {
  return new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    temperature: 1,
  });
}

const SYSTEM = [
  "You are a helpful planner",
  "Return a json that matches the following schema.",
  "Keep the steps concise and actionable and beginner friendly.",
].join("\n");

function userPrompt(input: string) {
  return [
    `User goal: ${input}`,
    "Draft a plan with 3-5 steps to achieve the user goal. Keep the steps concise and actionable and beginner friendly.",
    "- Each step should be a short sentence.",
  ].join("\n");
}

function takeFirstN(arr: string[], n = 5): string[] {
  const result = Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
  return result;
}

export async function planNode(state: State): Promise<Partial<State>> {
  if (state.status === "cancelled") return {};

  const model = makeModal();

  const stucturedResponse = model.withStructuredOutput(PlanSchema);

  const plan = await stucturedResponse.invoke([
    {
      role: "system",
      content: SYSTEM,
    },

    { role: "human", content: userPrompt(state.input) },
  ]);

  const steps = takeFirstN(plan.step, 5);

  return { steps: steps, status: "planned" };
}
