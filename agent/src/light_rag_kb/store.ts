type Provider = "openai" | "google";

function getProvider(): Provider {
  const getCurrentProvider = (
    process.env.RAG_MODEL_PROVIDER ?? "gemini"
  ).toLocaleLowerCase();

  return getCurrentProvider === "gemini" ? "google" : "openai";
}
