import { Router } from "express";
import { z } from "zod";
import { startAgent, ressumeAgent } from "../graph/graph";
const router = Router();

const StartSchema = z.object({
  input: z.string().min(1, "Input must be at least 5 characters long"),
});

const ApproveScheema = z.object({
  threadId: z.string().min(1, "threadId is required"),
  approve: z.boolean(),
});

router.post("/", async (req, res) => {
  const parsed = StartSchema.safeParse(req.body);

  if (!parsed.success)
    return res
      .status(400)
      .json({ staru: "error", error: "Error while parsing input" });

  try {
    const result = await startAgent(parsed.data.input);

    if ("final" in result)
      return res.json({
        status: "ok",
        data: { kind: "final", final: result.final },
      });

    if ("interrupt" in result)
      return res.json({
        status: "ok",
        data: {
          kind: "needs_approval",
          interrupt: {
            threadId: result.interrupt.threadId,
            steps: result.interrupt.steps,
            prompt: "Approve the generated plan to execute or reject to cancel",
          },
        },
      });

    return res.status(500).json({ status: "error", error: "Unknown error" });
  } catch (e: any) {
    return res.status(500).json({ status: "error", error: e.message });
  }
});

router.post("/approve", async (req, res) => {
  const parsed = ApproveScheema.safeParse(req.body);

  if (!parsed.success)
    return res
      .status(400)
      .json({ staru: "error", error: "Error while parsing input" });

  try {
    const { threadId, approve } = parsed.data;

    const final = await ressumeAgent({ threadId, approve });

    return res.json({ status: "ok", data: { kind: "final", final } });
  } catch (e: any) {
    return res.status(500).json({ status: "error", error: e.message });
  }
});

export default router;
