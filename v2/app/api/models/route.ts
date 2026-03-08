import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_KEY not configured" }, { status: 500 });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  const data = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };

  const generateModels = (data.models ?? [])
    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
    .map(m => m.name.replace("models/", ""));

  return NextResponse.json({ models: generateModels });
}
