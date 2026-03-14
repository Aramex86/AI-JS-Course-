import { env } from "../shared/env";
import { WebSearchResultShema } from "./schemas";

export async function webSearch(q: string) {
  const query = (q ?? "").trim();

  if (!query) return [];

  return await searchTavilyUtils(query);
}

async function searchTavilyUtils(query: string) {
  if (!env.TAVILY_API_KEY) {
    throw new Error("Tavily API key not found");
  }

  const res = await fetch(`https://api.tavily.com/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
      include_images: false,
    }),
  });

  if (!res.ok) {
    const text = await safeText(res);
    throw new Error(`Tavily API error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];

  const normalized = results.slice(0, 5).map((result: any) =>
    WebSearchResultShema.parse({
      title: String(result.title ?? "").trim() || "Untitled",
      url: String(result.url ?? "").trim(),
      snippet: String(result.content ?? "")
        .trim()
        .slice(0, 200),
    }),
  );

  return WebSearchResultShema.array().parse(normalized);
}

export async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "<>no content</>";
  }
}
