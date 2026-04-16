import { Router } from "express";
import { runProductAgent } from "../agent/03_agent";
import {
  appendToHistory,
  ChatRole,
  ensureThreadId,
  getHistory,
} from "../agent/04_memory";

export const agentRouter = Router();

agentRouter.post("/chat", async (req, res) => {
  try {
    const { message, threadId: incomingThreadId } = req.body as {
      message?: string;
      threadId?: string;
    };

    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Message is required",
      });
    }

    const threadId = await ensureThreadId(incomingThreadId ?? "");

    const history = await getHistory(threadId);

    const usermsg = {
      role: "user" as ChatRole,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    await appendToHistory(threadId, usermsg);

    const messagesForAgent = [...history, usermsg];

    const { answer, citations } = await runProductAgent(messagesForAgent);

    const assistantmsg = {
      role: "assistant" as ChatRole,
      content: answer,
      timestamp: new Date().toISOString(),
    };

    await appendToHistory(threadId, assistantmsg);

    return res.json({
      ok: true,
      threadId,
      answer,
      citations,
    });
  } catch (e: any) {
    console.log(e);
    return res.status(500).json({
      ok: false,
      message: "Some error occured",
    });
  }
});
