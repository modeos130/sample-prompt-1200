import { NextRequest, NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) return NextResponse.json({ error: "No key" }, { status: 500 });
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["TEXT", "IMAGE"], responseMimeType: "text/plain" } }),
    });
    if (!res.ok) return NextResponse.json({ error: `${res.status}`, detail: await res.text() }, { status: res.status });
    const data = await res.json();
    for (const c of (data.candidates || [])) for (const p of (c.content?.parts || [])) if (p.inlineData) return NextResponse.json({ mimeType: p.inlineData.mimeType, data: p.inlineData.data });
    return NextResponse.json({ error: "No image" }, { status: 500 });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
