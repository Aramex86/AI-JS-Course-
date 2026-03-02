type Provider = "openai" | "gemini" | "groq";

type HelloOutput = {
  ok: true;
  provider: Provider;
  model: string;
  message: string;
};
// gemini response types
type GeminiGenerateContent = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

/**
 * Makes a request to the Gemini API to generate content based on the input
 * and returns the response in the HelloOutput format.
 *
 * @throws {Error} If the GOOGLEAI_API_KEY environment variable is not set.
 * @throws {Error} If the response from the Gemini API is not ok.
 * @returns {Promise<HelloOutput>}
 */

async function helloGemini(): Promise<HelloOutput> {
  const apiKey = process.env.GOOGLEAI_API_KEY;

  if (!apiKey) throw new Error("GOOGLEAI_API_KEY is not set");

  const model = "gemini-2.5-flash-lite";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Say Hello Veaceslav!",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok)
    throw new Error(`Gemini: ${response.status}: ${await response.text()}`);

  const json = (await response.json()) as GeminiGenerateContent;
  const text =
    json.candidates?.[0].content?.parts?.[0].text ?? "Hello as default";

  return {
    ok: true,
    provider: "gemini",
    model,
    message: String(text).trim(),
  };
}

type OpenAiChatCompletion = {
  choices: Array<{
    message: {
      content?: string;
    };
  }>;
};

async function helloGroq(): Promise<HelloOutput> {
  const apiKey = process.env.GROQAI_API_KEY;

  if (!apiKey) throw new Error("GROQAI_API_KEY is not set");

  const model = "llama-3.1-8b-instant";

  const url = `https://api.groq.com/openai/v1/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: "Say Hello Veaceslav!",
        },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok)
    throw new Error(`Groq: ${response.status}: ${await response.text()}`);

  const json = (await response.json()) as OpenAiChatCompletion;
  const content = json.choices?.[0].message.content ?? "Hello as default";

  return {
    ok: true,
    provider: "groq",
    model,
    message: String(content).trim(),
  };
}

async function helloOpenai(): Promise<HelloOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const model = "gpt-5-nano";

  const url = `https://api.openai.com/v1/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: "Say Hello Veaceslav!",
        },
      ],
      // temperature: 0,
    }),
  });

  if (!response.ok)
    throw new Error(`OpenAI: ${response.status}: ${await response.text()}`);

  const json = (await response.json()) as OpenAiChatCompletion;
  const content = json.choices?.[0].message.content ?? "Hello as default";

  return {
    ok: true,
    provider: "openai",
    model,
    message: String(content).trim(),
  };
}

export async function selectHello(): Promise<HelloOutput> {
  const defaultProvider = (process.env.PROVIDER || "").toLocaleLowerCase();

  if (defaultProvider === "gemini") return await helloGemini();
  if (defaultProvider === "groq") return await helloGroq();
  if (defaultProvider === "openai") return await helloOpenai();

  if (defaultProvider)
    throw new Error(
      `Unsupported provider: ${defaultProvider}, use one of: gemini, groq, openai`,
    );

  if (process.env.GOOGLEAI_API_KEY) {
    try {
      return await helloGemini();
    } catch {}
  }
  if (process.env.GROQAI_API_KEY) {
    try {
      return await helloGroq();
    } catch {}
  }

  throw new Error(`No provider found, use one of: gemini, groq, openai`);
}
