import { getCategoryRule } from "./category-rules";

export async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const noScript = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const preview = noScript.slice(0, 1200).trim();
    const parts = [title, preview].filter(Boolean);
    return parts.length > 0 ? parts.join("\n\n") : null;
  } catch {
    return null;
  }
}

export async function suggestCategories(
  website: { id: string; name: string; url?: string | null },
  links: string[],
  apiKey: string,
  pageTexts: Record<string, string | null> = {},
  model = "openai/gpt-4o-mini"
): Promise<{ link: string; sub: string[] }[]> {
  const rule = getCategoryRule(website);

  if (!rule) {
    return links.map((link) => ({
      link,
      sub: [],
    }));
  }

  const prompt = `You are a CMS article classifier.

Website: ${website.name} (${website.url || "no URL"})
Allowed Sub Categories:
${rule.subCategories.join("\n")}

Rules:
${rule.instructions}

For each link below, use the extracted page text (title and first few paragraphs) if it is available. If no page text is available, use the URL path/slug and any link text to infer the topic. Return the single best primary sub category first, followed by up to 2 additional relevant sub categories. All values must be exact matches from the Allowed Sub Categories list. Do not repeat the primary category in the additional ones, and do not guess categories that are not in the list.
Return only valid JSON in this exact format, with no markdown and no extra text:
{
  "suggestions": [
    { "link": "...", "sub": ["...", "..."] }
  ]
}

Links:
${links
  .map(
    (l, i) =>
      `${i + 1}. ${l}\nText preview (if any): ${
        pageTexts[l] || "No preview"
      }`
  )
  .join("\n\n")}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content as string | undefined;
  if (!content) {
    throw new Error("No response from OpenRouter");
  }

  const parsed = JSON.parse(content);
  return (parsed.suggestions || []).map((s: any) => ({
    link: s.link || "",
    sub: Array.isArray(s.sub) ? s.sub.slice(0, 3) : [],
  }));
}
