// first node after start
import type { State } from "../types";

//Validate the input and trim it to a reasonable length
export async function validateNode(state: State): Promise<Partial<State>> {
  const raw = state.input.trim() ?? "";
  const trimmedInput = raw.trim();

  if (trimmedInput.length < 0) {
    return {
      status: "cancelled",
      message: "Input is empty. Please provide more details.",
    };
  }

  const MAX = 300;

  const safeInput =
    trimmedInput.length > MAX
      ? trimmedInput.slice(0, MAX) + "..."
      : trimmedInput;

  return { input: safeInput };
}
