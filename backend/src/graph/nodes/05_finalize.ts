import { State } from "../types";

export async function finalizeNode(state: State): Promise<Partial<State>> {
  const approved = state.approved || false;
  const results = state.results || [];
  const steps = state.steps || [];
  const currentStatus = state.status;

  let status: State["status"];

  if (approved) status = "done";
  if (!approved) status = "cancelled";

  if (currentStatus === "cancelled" || approved === false) {
    status = "cancelled";
  } else {
    status = "done";
  }

  let message: string;

  if (status === "cancelled") {
    message =
      state.message ??
      `Execution cancelled. ${steps.length ? "User rejected the plan." : "Canceled before execution."} `;
  } else {
    message =
      state.message ??
      `Execution completed successfully. ${results.length ? `Completed ${results.length}` : steps.length ? "Plan is approved." : "Finished all steps."} `;
  }

  return {
    status,
    message,
    steps,
    results,
  };
}
