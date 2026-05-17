const API_VERSIONS = ["v1beta", "v1"];

interface GeminiTextResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export class GeminiPromptError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiPromptError";
    this.status = status;
  }
}

function promptModelCandidates() {
  return [
    process.env.GEMINI_PROMPT_MODEL,
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
  ].filter((model, index, models): model is string =>
    Boolean(model) && models.indexOf(model) === index
  );
}

function extractText(data: GeminiTextResponse) {
  return data.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? "")
    .join("")
    .trim() ?? "";
}

export async function generatePromptWithGemini({
  apiKey,
  systemPrompt,
  vibe,
}: {
  apiKey: string;
  systemPrompt: string;
  vibe: string;
}) {
  let lastError = "";

  for (const model of promptModelCandidates()) {
    for (const version of API_VERSIONS) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `${systemPrompt}\n\nProducer vibe: "${vibe.trim()}"\n\nWrite the prompt now. Remember: one paragraph, under 1000 characters, no real names, no drums.`,
            }],
          }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 400,
          },
        }),
      });

      const data = await response.json() as GeminiTextResponse;
      const message = data.error?.message ?? `Gemini API error ${response.status}`;

      if (response.status === 404) {
        lastError = message;
        continue;
      }

      if (!response.ok) {
        throw new GeminiPromptError(message, response.status);
      }

      const prompt = extractText(data);
      if (!prompt) {
        throw new GeminiPromptError("Empty response from Gemini.", 502);
      }

      return prompt;
    }
  }

  throw new GeminiPromptError(lastError || "Gemini prompt model is not available.", 404);
}
