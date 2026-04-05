// role -> pause the graph to aks the human for the input to approve the plan

import { State } from "../types";

export async function approveNode(
  state: State,
  context: any,
): Promise<Partial<State>> {
  if (state.status === "cancelled") return {};

  const steps = state.steps || [];

  if (steps.length === 0) {
    return {
      approved: true,
      message: "No steps to approve, moving forward.",
    };
  }

  const interupt = context.interrupt as (payload: unknown) => Promise<unknown>;

  const decision = await interupt({
    type: "approval_request",
    steps,
  });

  let approved: boolean;

  if (
    typeof decision &&
    typeof decision === "object" &&
    "approve" in decision!
  ) {
    approved = !!decision.approve;
  } else {
    approved = !!decision;
  }

  return {
    approved,
  };
}
