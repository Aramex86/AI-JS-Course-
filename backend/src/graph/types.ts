import { z } from "zod";

// Define the state that flows through the langGraph
// GRAHP = State + Nodes + Edges

export const ExicutionStatus = z.enum(["planned", "done", "cancelled"]);

export type ExicutionStatus = z.infer<typeof ExicutionStatus>;

//step result

export const StepResult = z.object({
  step: z.string(),
  note: z.string(),
});

//state -> zod schema
export const StateSchema = z.object({
  input: z.string().min(5, "Input must be at least 5 characters long"),
  steps: z.array(z.string()).optional(),
  approved: z.boolean().optional(),
  rezults: z.array(StepResult).optional(),
  status: ExicutionStatus.optional(),
  stepResults: z.array(StepResult).optional(),
  message: z.string().optional(),
});

export type State = z.infer<typeof StateSchema>;

//initial state helper function
export function createInitialState(input: string): State {
  return {
    input,
    status: "planned",
  };
}
