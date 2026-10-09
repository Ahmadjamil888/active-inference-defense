import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";
export const AI_MODEL = "openai/gpt-6-astra";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

/** Streams a Responses call through Lovable AI Gateway and returns final text. */
export async function aiText(system: string, prompt: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured (missing key).");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(AI_MODEL),
    system,
    prompt,
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  if (!text && failure) {
    const e = failure as { statusCode?: number; message?: string };
    if (e.statusCode === 402) throw new Error("AI credits exhausted — add credits in workspace billing.");
    if (e.statusCode === 429) throw new Error("AI rate limited — try again in a moment.");
    throw new Error(e.message || "AI request failed");
  }
  return text;
}
