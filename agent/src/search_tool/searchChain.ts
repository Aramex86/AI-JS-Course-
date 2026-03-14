import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import { webBasePath } from "./webPipeline";
import { directBasePath } from "./directPipeline";
import { routerStep } from "./routeStrategy";
import { finalValidateAndPolish } from "./finalVlidate";
import { SearchInput } from "../utils/schemas";

const branch = RunnableBranch.from<{ q: string; mode: "web" | "direct" }, any>([
  [(input) => input.mode === "web", webBasePath],
  directBasePath,
]);

export const searchChain = RunnableSequence.from([
  routerStep,
  branch,
  finalValidateAndPolish,
]);

export async function runSearch(input: SearchInput) {
  return await searchChain.invoke(input);
}
