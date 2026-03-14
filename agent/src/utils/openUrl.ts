import { OpenUrlOUtputSchema } from "./schemas";
import { safeText } from "./webSearch";
import { convert } from "html-to-text";

export async function openUrl(url: string) {
  const normalized = validateUrl(url);

  const res = await fetch(normalized, {
    headers: {
      "User-Agent": "agent-core/1.0.0",
    },
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`Request failed: ${res.status} - ${body.slice(0, 100)}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  const text = contentType.includes("text/html")
    ? convert(raw, {
        wordwrap: false,
        selectors: [
          {
            selector: "nav",
            format: "skip",
          },
          {
            selector: "header",
            format: "skip",
          },
          {
            selector: "footer",
            format: "skip",
          },
          {
            selector: "script",
            format: "skip",
          },
        ],
      })
    : raw;

  const cleaned = collapseWhitespace(text);

  const capped = cleaned.slice(0, 1000);

  return OpenUrlOUtputSchema.parse({ url: normalized, content: capped });
}

function validateUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (!/^https?:\/\//.test(parsedUrl.protocol))
      throw new Error("Invalid URL only https:// and http:// are allowed");
    return parsedUrl.toString();
  } catch {
    throw new Error("Invalid URL");
  }
}

function collapseWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
